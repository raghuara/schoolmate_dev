import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { FindNews, postNews, updateNews } from "../../../../Api/Api";
import SnackBar from "../../../SnackBar";
import CancelIcon from "@mui/icons-material/Cancel";
import SimpleTextEditor from "../../../EditTextEditor";
import Loader from "../../../Loader";

export default function NewsDraftEditPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsStatus, setNewsStatus] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name

    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');

    const [activeTab, setActiveTab] = useState(0);
    const [forActiveTab, setForActiveTab] = useState(0);
    const [pasteLinkToggle, setPasteLinkToggle] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pastedLink, setPastedLink] = useState("");
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [content, setContent] = useState('');
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

    const [previewData, setPreviewData] = useState({
        heading: '',
        content: '',
        uploadedFiles: [],
        fetchedImage,
        pastedLink: '',
    });


    const websiteSettings = useSelector(selectWebsiteSettings);

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

    const handleRichTextChange = (htmlContent) => {
        setChangesHappended(true)
        setNewsContentHTML(htmlContent);
    };


    const handlePreview = () => {
        setPreviewData({
            heading,
            content: newsContentHTML,
            uploadedFiles,
            fetchedImage,
            pastedLink,
        });
    };

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
            navigate('/dashboardmenu/draft/news')
        }

    };
    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/draft/news')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/draft/news')
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
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSelectedNewsData(res.data)
            setHeading(res.data.headLine ?? "")
            setNewsStatus(res.data.status)
            setNewsContentHTML(res.data.news ?? "")
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
            sendData.append("Id", id);
            sendData.append("RollNumber", rollNumber);
            sendData.append("HeadLine", heading);
            sendData.append("News", newsContentHTML);
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("FileType", fileType || "empty");
            sendData.append("UserType", userType);
            sendData.append("Link", pastedLink || '');
            sendData.append("ScheduleOn", formattedDTValue || dateTimeValue || "");
            sendData.append("PostedOn", todayDateTime || "");
            sendData.append("UpdatedOn", todayDateTime || "");

            const res = await axios.put(updateNews, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            if (userType === "superadmin") {
                if (status === "post") {
                    setMessage("News updated successfully");
                } else {
                    setMessage("News scheduled successfully");
                }
            }

            if (userType !== "superadmin") {
                setMessage("Requested successfully");
            }
            setTimeout(() => {
                navigate('/dashboardmenu/draft/news')
            }, 1000);
        } catch (error) {
            console.error("Error while inserting news data:", error);
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message || error.response.data;

                if (errorMessage.includes("ScheduleOn must be a future date and time")) {
                    setMessage("The scheduled date must be set in the future.");
                    setOpen(true);
                    setColor(false);
                    setStatus(false);
                }
            }
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
                borderBottom: "1px solid #ddd",
                px: 2,
                display: "flex",
                alignItems: "center",
                width: "100%",
                p: 1.5,
                marginTop: "-2px"
            }}>

                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit News</Typography>
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
                        <Typography>Add Heading</Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff" }}
                            id="outlined-size-small"
                            size="small"
                            fullWidth
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


                        <Typography sx={{ pt: 3 }}>Add Description</Typography>
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
                                borderRadius: "7px",
                                pt: 3
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
                                        InputProps={{
                                            startAdornment: (
                                                <InsertLinkIcon sx={{ mr: 1, color: "text.secondary" }} />
                                            ),
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
                        <Box mt={2}>
                            <Typography>Schedule </Typography>
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
                                                    Discard
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
                                                    Publish
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
                                }  {userType !== "superadmin" &&
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
                        <Box p={1}>
                            {previewData.heading && (
                                <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                    {previewData.heading}
                                </Typography>
                            )}

                            {previewData.content && (
                                <Typography
                                    sx={{ fontSize: "14px", pt: 1, }}
                                    dangerouslySetInnerHTML={{ __html: previewData.content }}
                                />
                            )}



                            {previewData.uploadedFiles.length > 0 && !previewData.pastedLink && (
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
                            )}

                            {previewData.fetchedImage.length > 0 && !previewData.pastedLink && (
                                <Grid container spacing={2}>
                                    <Grid
                                        sx={{ display: "flex", py: 1 }}
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            md: 5,
                                            lg: 12
                                        }}>
                                        <img
                                            src={fetchedImage}
                                            width={'273px'}
                                            height={'210px'}
                                            alt={'Uploaded file'}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {!previewData.uploadedFiles.length && previewData.pastedLink && (
                                <>
                                    {isYouTubeLink(previewData.pastedLink) ? (
                                        <Box>
                                            <ReactPlayer
                                                url={previewData.pastedLink}
                                                width='273px'
                                                height='210px'
                                                playing={false}
                                            />
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography color="error">
                                                Please provide a valid YouTube link.
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}




                        </Box>
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
