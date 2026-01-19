import React, { useEffect, useRef, useState } from "react";
import { Box, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, InputAdornment, Grid, } from "@mui/material";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import SnackBar from "../../SnackBar";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import axios from "axios";
import { deleteTeachersTimeTable, fetchTeachersTimeTable, postTeachersTimeTable, updateTeachersTimeTable } from "../../../Api/Api";
import CloseIcon from '@mui/icons-material/Close';
import Loader from "../../Loader";


export default function CreateTeacherTimeTablesPage() {
    const navigate = useNavigate();
    const token = "123";
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [enable, setEnable] = useState({});
    const [isLoading, setIsLoading] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [changesHappended, setChangesHappended] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const fileInputRef = useRef(null);
    const [openImage, setOpenImage] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedPreviewImage, setSelectedPreviewImage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [teachersData, setTeachersData] = useState([]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [deleteId, setDeleteId] = useState('');

    const handleViewClick = (imageUrl) => {
        if (imageUrl) {
            setSelectedImage(imageUrl);
            setOpenImage(true);
        }
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleImageClose1 = () => {
        setOpenPreview(false);
    };

    const handlePreview = (imageUrl) => {
        if (imageUrl) {
            setSelectedPreviewImage(imageUrl);
            setOpenPreview(true);
        }
    };

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/timetables')
        }

    };

    const cellStyle = {
        borderRight: 1,
        borderColor: "#E8DDEA",
        textAlign: "center",
        minWidth: 120,
    };
    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e, employeeCode) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                alert("Only PNG, JPG, JPEG, and WEBP files are allowed.");
                return;
            }
            setUploadedFiles(file);
            setEnable((prevState) => ({
                ...prevState,
                [employeeCode]: true,
            }));
        }
    };

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchTeachersTimeTable, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTeachersData(res.data.teachersTimeTableData)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = teachersData.filter((row) =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const savePostData = async (code) => {
        setIsLoading(true);
        try {
            const sendData = new FormData();
            sendData.append("RollNumber", code);
            sendData.append("File", uploadedFiles);
            const res = await axios.post(postTeachersTimeTable, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.data.error) {
                fetchData();
                setOpen(true);
                setColor(true);
                setStatus(true);
                setMessage("Timetable Added Successfully");
                setUploadedFiles(null)
            } else {
                setOpen(true);
                setColor(false);
                setStatus(false);
                setMessage("Failed to upload");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    const UpdateData = async (code) => {
        setIsLoading(true);
        try {
            const sendData = new FormData();
            sendData.append("RollNumber", code);
            sendData.append("File", uploadedFiles);
            const res = await axios.put(updateTeachersTimeTable, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.data.error) {
                fetchData();
                setOpen(true);
                setColor(true);
                setStatus(true);
                setMessage("Timetable Updated Successfully");
                setUploadedFiles(null)
            } else {
                setOpen(true);
                setColor(false);
                setStatus(false);
                setMessage("Failed to upload");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenAlert(true);
    };

    const handleCloseDialog = (deleted) => {
        setOpenAlert(false);
        if (deleted) {
            DeleteNews(deleteId)
            setOpenAlert(false);
        }
    };

    const DeleteNews = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(deleteTeachersTimeTable, {
                params: {
                    RollNumber: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.data.error) {
                fetchData();
                setOpen(true);
                setColor(true);
                setStatus(true);
                setMessage("Deleted Succesfully");

            } else {
                setOpen(true);
                setColor(false);
                setStatus(false);
                setMessage("Failed to delete");
            }

        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete. Please try again.");
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
                position: "fixed", zIndex: 100, backgroundColor: "#f2f2f2", display: "flex", alignItems: "center", width: "100%", py: 1.5, marginTop: "-2px",   borderBottom:"1px solid #ddd", px:2
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Teachers Time Tables</Typography>
            </Box>

            <Box sx={{ pt: 10 }}>
                <Grid container sx={{ display: "flex", justifyContent: "end", px: 2 }}>
                    <Grid size={{ lg: 3, xs: 12, sm: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search Teachers by Name or Employee Code"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                sx: {
                                    padding: "0 10px",
                                    borderRadius: "50px",
                                    height: "28px",
                                    fontSize: "12px",
                                },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    minHeight: "28px",
                                    paddingRight: "3px",
                                    backgroundColor: "#fff",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Dialog open={openImage} onClose={() => setOpenImage(false)} sx={{
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
                    }}>
                    <img
                        src={selectedImage}
                        alt="Popup"
                        style={{ width: 'auto', height: 'auto', maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: 'auto', }}
                    />
                    <DialogActions
                        sx={{ position: 'absolute', top: '-40px', right: "-50px", padding: 0, }}
                    >
                        <IconButton
                            onClick={handleImageClose}
                            sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogActions>
                </Dialog>
                <Dialog open={openPreview} onClose={() => setOpenPreview(false)} sx={{
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
                    }}>
                    <img
                        src={selectedPreviewImage}
                        alt="Popup"
                        style={{ width: 'auto', height: 'auto', maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: 'auto', }}
                    />
                    <DialogActions
                        sx={{ position: 'absolute', top: '-40px', right: "-50px", padding: 0, }}
                    >
                        <IconButton
                            onClick={handleImageClose1}
                            sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogActions>
                </Dialog>
                <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}> Do you really want to delete this news?</Typography>
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
                                    Cancel
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
                                    Delete
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>
                <Box sx={{ px: 2, pb: 2 }}>
                    <Box
                        sx={{
                            background: "linear-gradient(180deg, #307EB9 0%, #00467B 100%)",
                            width: "150px",
                            textAlign: "center",
                            color: "#fff",
                            borderRadius: "5px 0px 0px 0px",
                            padding: "5px 0",
                        }}
                    >
                        Teaching Staff
                    </Box>

                    <TableContainer
                        sx={{
                            width: "100%",
                            maxWidth: "100%",
                            overflowX: "auto",
                            border: "1px solid #E8DDEA",
                            position: "relative",
                            bottom: 0,
                            backgroundColor: "#fff"
                        }}
                    >
                        <Table stickyHeader sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {["S.No", "Employee Code", "Name", "Photo", "Upload Image", "Preview", "Delete", "Submit"].map(
                                        (header) => (
                                            <TableCell
                                                key={header}
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#FFF7F7",
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        )
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => (
                                    <TableRow key={row.employeeCode}>
                                        <TableCell sx={cellStyle}>{index + 1}</TableCell>
                                        <TableCell sx={cellStyle}>{row.employeeCode}</TableCell>
                                        <TableCell sx={cellStyle}>{row.name}</TableCell>
                                        <TableCell sx={cellStyle}>
                                            <Button
                                                sx={{ color: "#000", textTransform: "none" }}
                                                onClick={() => handleViewClick(row.photo)}
                                            >
                                                <ImageIcon sx={{ color: "#000", marginRight: 1 }} />
                                                View
                                            </Button>
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <Button
                                                variant="outlined"
                                                sx={{
                                                    border: "1px solid black",
                                                    width: "135px",
                                                    fontSize: "13px",
                                                    py: 0,
                                                    color: "#000",
                                                    textTransform: "none",
                                                    borderRadius: "50px",
                                                }}
                                                onClick={handleUploadClick}
                                            >
                                                {row.preView == null || row.preView === "" ? "Upload Image" : "Reupload Image"}
                                            </Button>

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => handleFileChange(e, row.employeeCode)}
                                                style={{ display: "none" }}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <Button
                                                sx={{ color: "#E60154", textTransform: "none", borderRadius: "50px", py: 0, backgroundColor: "#fcf6f0" }}
                                                disabled={row.preView == null || row.preView === ""}
                                                onClick={() => handlePreview(row.preView)}
                                            >
                                                View Image
                                            </Button>
                                        </TableCell>

                                        <TableCell sx={cellStyle}>
                                            <IconButton
                                                onClick={() => handleDelete(row.employeeCode)}
                                                sx={{
                                                    border: "1px solid black",
                                                    width: "25px",
                                                    height: "25px",
                                                    backgroundColor: "#fff",
                                                }}
                                            >
                                                <DeleteOutlineOutlinedIcon
                                                    style={{ fontSize: "15px", color: "#000" }}

                                                />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            {row.preView == null || row.preView === "" ? (
                                                <Button
                                                    // disabled={!enable[row.employeeCode]}
                                                    onClick={() => savePostData(row.employeeCode)} sx={{ color: websiteSettings.textColor, textTransform: "none", backgroundColor: websiteSettings.mainColor, py: 0, borderRadius: "50px", fontSize: "13px", }}>Save</Button>
                                            ) : (
                                                <Button
                                                    // disabled={!uploadedFiles[row.employeeCode]}
                                                    onClick={() => UpdateData(row.employeeCode)} sx={{ color: websiteSettings.textColor, textTransform: "none", backgroundColor: websiteSettings.mainColor, py: 0, borderRadius: "50px", fontSize: "13px", width: "70px" }}>Update</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Box>
            </Box>
        </Box>
    );
}
