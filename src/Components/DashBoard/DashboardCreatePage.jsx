import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { deleteDashboardSlider, getDashboardSliders, GettingGrades, postDashboardSliders, postMessage, postNews, postTimeTable, sectionsDropdown, TimeTableFetch } from "../../Api/Api";
import SnackBar from "../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import SliderImage from "../../Images/PagesImage/timetable.png"
import SliderImages from "../../Images/PagesImage/news.png"
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import Loader from "../Loader";

export default function CreateDashboardPage() {
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
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [sliders, setSliders] = useState([]);
    const [deleteId, setDeleteId] = useState('');

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/dashboard')
        }

    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenDeleteAlert(true);
    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/dashboard')
        }
    };
    const handleCloseDialog1 = (confirmed) => {
        setOpenDeleteAlert(false);

        if (confirmed) {
            DeleteSlider(deleteId)
            setOpenDeleteAlert(false);
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
    const handleImageClose1 = () => {
        setOpenImage(false)
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    useEffect(() => {
        fetchFolder();
    }, []);

    const fetchFolder = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getDashboardSliders, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSliders(res.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsertMessageData = async () => {
        if (!(uploadedFiles[0] instanceof File)) {
            setMessage("Invalid file. Please re-upload.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        setIsLoading(true);
        try {
            const sendData = new FormData();
            sendData.append("RollNumber", rollNumber);
            sendData.append("FileType", "image");
            sendData.append("File", uploadedFiles[0] || '');

            const res = await axios.post(postDashboardSliders, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Added successfully");
            setOpen(true);
            setColor(true);
            setStatus(true);
            setUploadedFiles([])
            fetchFolder()
        } catch (error) {
            console.error("Error while inserting:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An error occurred while uploading data.");
            }
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const DeleteSlider = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(deleteDashboardSlider, {
                data: {
                    id: id,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchFolder();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Deleted Successfully");

        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete news. Please try again.");
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "superadmin" && userType !== "admin") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
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
                py: 1.5,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Dashboard Sliders</Typography>
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
                    <Box sx={{ backgroundColor: "#fbfbfb", py: 2, borderRadius: "7px", mt: 4.5, height: "75.6vh", overflowY: "auto", position: "relative" }}>
                        <Grid container spacing={2} sx={{ px: 2 }}>
                            <Grid
                                size={{
                                    lg: 12
                                }}>
                                <Typography sx={{ mb: 0.5, }}>Select Image</Typography>
                                <Box sx={{ mt: 1, textAlign: "center" }}>
                                    <Box
                                        {...getRootProps()}
                                        sx={{
                                            border: "2px dashed #1976d2",
                                            borderRadius: "8px",
                                            px: 1,
                                            py: 3,
                                            backgroundColor: isDragActive ? "#e3f2fd" : "#f5f5f5",
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

                        <Box sx={{ mt: 3, }}>
                            <Grid container spacing={2} sx={{ position: "absolute", bottom: "10px", px: 2 }}>
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
                                            width: "80px",
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            py: 0.2,
                                            border: '1px solid black',
                                            color: 'black',
                                            fontWeight: "600",
                                        }}
                                        onClick={handleBackClick}>
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
                                        Save
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
                <Dialog open={openDeleteAlert} onClose={() => setOpenDeleteAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}> Do you really want to delete this slider?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleCloseDialog1(false)}
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
                                    onClick={() => handleCloseDialog1(true)}
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
                    <Box sx={{ backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75.6vh", overflowY: "auto" }}>
                        <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)" }}>Dashboard Sliders</Typography>
                        <hr style={{ border: "0.5px solid #CFCFCF" }} />

                        <Grid container>
                            {sliders.map((slider, index) => (
                                <Grid
                                    key={index}
                                    sx={{ display: "flex", justifyContent: "center", mt: 2, px: 0.5 }}
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 4
                                    }}>
                                    <Box
                                        sx={{
                                            position: "relative",
                                            width: "170px",
                                            height: "170px",
                                            border: "1px solid #ccc",
                                            "&:hover .overlay": {
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        <img src={slider.filePath} width={"100%"} height={"100%"} alt="image" style={{ display: "block" }} />
                                        <Box
                                            className="overlay"
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                opacity: 0,
                                                transition: "opacity 0.3s ease-in-out",
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                sx={{
                                                    textTransform: "none",
                                                    padding: "2px 15px",
                                                    borderRadius: "30px",
                                                    fontSize: "12px",
                                                    border: "2px solid white",
                                                    color: "white",
                                                    fontWeight: "600",
                                                    backgroundColor: "transparent",
                                                }}
                                                onClick={() => handleViewClick(slider.filePath)}
                                            >
                                                View Image
                                            </Button>
                                        </Box>

                                        {/* Delete Icon */}
                                        <Box sx={{ position: "absolute", bottom: "18px", right: "18px" }}>
                                            <IconButton
                                                sx={{
                                                    border: "1px solid black",
                                                    width: "25px",
                                                    height: "25px",
                                                    backgroundColor: "#fff !important",
                                                }}
                                                onClick={() => handleDelete(slider.id)}
                                            >
                                                <DeleteOutlineOutlinedIcon style={{ fontSize: "15px", color: "#000" }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Dialog
                            open={openImage}
                            onClose={handleImageClose}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& .MuiPaper-root': {
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    borderRadius: 0,
                                    padding: 0,
                                    overflow: 'visible',
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                },
                            }}
                            BackdropProps={{
                                style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                            }}
                        >
                            {/* Image */}
                            <img
                                src={imageUrl}
                                alt="Popup"
                                style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '80vw',
                                    maxHeight: '80vh',
                                    display: 'block',
                                    margin: 'auto',
                                }}
                            />

                            {/* Close Button */}
                            <DialogActions
                                sx={{
                                    position: 'absolute',
                                    top: '-40px',
                                    right: "-50px",
                                    padding: 0,
                                }}
                            >
                                <IconButton
                                    onClick={handleImageClose1}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        color: '#fff',
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
