import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, FormControl, Select, OutlinedInput, MenuItem, Checkbox } from "@mui/material";
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
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { FindCircular, GettingGrades, postCircular, postNews, updateCircular } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import CancelIcon from "@mui/icons-material/Cancel";
import SimpleTextEditor from "../../EditTextEditor";
import { selectGrades } from "../../../Redux/Slices/DropdownController";

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

    const [previewData, setPreviewData] = useState({
        heading: '',
        content: '',
        uploadedFiles: [],
        fetchedImage,
    });


    const websiteSettings = useSelector(selectWebsiteSettings);

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

    const handleRichTextChange = (htmlContent) => {
        setChangesHappended(true)
        setNewsContentHTML(htmlContent);
    };


    const handlePreview = () => {
        setPreviewData({
            heading,
            content: newsContentHTML,
            uploadedFiles,
            fetchedImage
        });
    };

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
                    Id: id
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

            sendData.append("Id", id);
            sendData.append("RollNumber", rollNumber);
            sendData.append("UserType", userType);
            sendData.append("HeadLine", heading);
            sendData.append("Circular", newsContentHTML);
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("FileType", fileType);
            sendData.append("ScheduleOn", formattedDTValue || dateTimeValue || "");
            sendData.append("UpdatedOn", todayDateTime || "");
            sendData.append("Everyone", isEveryone || "");
            sendData.append("Students", isStudents || "");
            sendData.append("Staffs", isStaffs || "");
            sendData.append("Specific", isSpecific || "");

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

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/circulars" replace />;
    }

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
                width: "100%",
                py: 1.5,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Circulars</Typography>
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
                    <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "7px", mt: 4.5, maxHeight: "75.6vh", overflowY: "auto" }}>
                        <Typography >Add Heading <span style={{ color: "#777", fontSize: "13px", }}> (Required)</span></Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff" }}
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

                        <Typography sx={{ pt: 3 }}>Add Description<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>

                        <SimpleTextEditor
                            value={newsContentHTML}
                            onContentChange={handleRichTextChange}
                        />

                        {isSubmitted && !newsContentHTML.trim() && (
                            <span style={{ color: "red", fontSize: "12px" }}>
                                This field is required
                            </span>
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
                        <Box sx={{ mt: 3 }}>
                            <Grid container>
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 4.4
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
                                            width: "80px",
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

                                {userType === "superadmin" &&
                                    <>

                                        {!DTValue && (
                                            <Grid
                                                sx={{ display: "flex", justifyContent: "end" }}
                                                size={{
                                                    xs: 6,
                                                    sm: 6,
                                                    md: 6,
                                                    lg: 3
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
                                                    lg: 3
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
                                    </>
                                }

                                {userType !== "superadmin" &&
                                    <>
                                        <Grid
                                            sx={{ display: "flex", justifyContent: "end" }}
                                            size={{
                                                xs: 6,
                                                sm: 6,
                                                md: 6,
                                                lg: 3
                                            }}>

                                            <Button
                                                sx={{
                                                    textTransform: 'none',
                                                    backgroundColor: websiteSettings.mainColor,
                                                    width: "100px",
                                                    borderRadius: '30px',
                                                    fontSize: '12px',
                                                    py: 0.2,
                                                    color: websiteSettings.textColor,
                                                    fontWeight: "600",
                                                }}
                                                onClick={() => handleUpdate(DTValue ? 'schedule' : 'post')}>
                                                Request Now
                                            </Button>
                                        </Grid>
                                    </>
                                }
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

                            {previewData.content && (
                                <Typography
                                    sx={{ fontSize: "14px", pt: 1 }}
                                    dangerouslySetInnerHTML={{ __html: previewData.content }}
                                />
                            )}

                            {previewData.uploadedFiles.length > 0 ? (
                                previewData.uploadedFiles.map((file, index) => (
                                    <Grid
                                        key={index}
                                        sx={{ display: "flex", py: 1 }}
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            md: 5,
                                            lg: 12
                                        }}>
                                        {file.type.startsWith("image/") ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                width="273px"
                                                height="210px"
                                                alt={`Uploaded file ${index + 1}`}
                                            />
                                        ) : file.type === "application/pdf" ? (
                                            <iframe
                                                src={URL.createObjectURL(file)}
                                                width="400px"
                                                height="400px"
                                                title={`Uploaded PDF ${index + 1}`}
                                            ></iframe>
                                        ) : null}
                                    </Grid>
                                ))
                            ) : previewData.fetchedImage ? (
                                fetchedFile === "image" ? (
                                    <img
                                        src={previewData.fetchedImage}
                                        width="273px"
                                        height="210px"
                                        alt="Fetched Image"
                                    />
                                ) : fetchedFile === "pdf" ? (
                                    <iframe
                                        src={previewData.fetchedImage}
                                        width="400px"
                                        height="400px"
                                        title="Fetched PDF"
                                    ></iframe>
                                ) : null
                            ) : null}
                        </Box>

                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
