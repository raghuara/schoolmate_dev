import React, { useEffect, useRef, useState } from "react";
import { Box, TextField, Typography, Button, Chip, IconButton, Dialog, DialogActions, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, InputAdornment, Tooltip, } from "@mui/material";
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
import UploadFileIcon from "@mui/icons-material/UploadFile";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";


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
    const fileInputRefs = useRef({});
    const [stagedFor, setStagedFor] = useState(null);
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

    const handleUploadClick = (employeeCode) => {
        fileInputRefs.current[employeeCode]?.click();
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
            setStagedFor(employeeCode);
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
                    rollNumber: rollNumber,
                    userType: userType,
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
            sendData.append("rollNumber", code);
            sendData.append("file", uploadedFiles);
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
                setUploadedFiles(null); setStagedFor(null);
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
            sendData.append("rollNumber", code);
            sendData.append("file", uploadedFiles);
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
                setUploadedFiles(null); setStagedFor(null);
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
                    rollNumber: id
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
    const ghostButtonSx = {
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 600,
        px: 2.4,
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

    const headCellSx = {
        borderRight: "1px solid #EDEFF3",
        borderBottom: "1px solid #E6E8EC",
        backgroundColor: "#FAFBFC",
        color: "#6B7280",
        fontSize: "10.5px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textAlign: "center",
        py: 1.2,
        whiteSpace: "nowrap",
    };

    const bodyCellSx = {
        borderRight: "1px solid #F3F4F6",
        borderBottom: "1px solid #F3F4F6",
        textAlign: "center",
        minWidth: 120,
        py: 1,
    };

    const smallIconSx = {
        width: "26px",
        height: "26px",
        border: "1px solid #DDE1E6",
        backgroundColor: "#fff",
        transition: "0.2s",
        "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#f44336" },
    };

    const uploadedCount = filteredData.filter((r) => r.preView).length;

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{
                position: "fixed", zIndex: 100, backgroundColor: "#f2f2f2",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", py: 1.5, marginTop: "-2px",
                borderBottom: "1px solid #ddd", px: 2
            }}>
                <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Teachers Time Tables</Typography>
                </Box>

                <Chip
                    size="small"
                    icon={<BadgeOutlinedIcon sx={{ fontSize: 16 }} />}
                    label="Teaching Staff"
                    sx={{
                        mr: 2,
                        display: { xs: "none", sm: "inline-flex" },
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "1px solid #C9DCF5",
                        backgroundColor: "#EEF5FF",
                        color: "#2563EB",
                        "& .MuiChip-icon": { color: "inherit" },
                    }}
                />
            </Box>

            <Box sx={{ pt: 9 }}>
                <Box sx={{ px: 2, pb: 2 }}>
                    <Box sx={{
                        border: "1px solid #E6E8EC",
                        boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                        borderRadius: "12px",
                        backgroundColor: "#fff",
                        overflow: "hidden",
                    }}>
                        {/* Panel header — title, progress and search on one row */}
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            px: 2,
                            py: 1.4,
                            borderBottom: "1px solid #EDEFF3",
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                <Box sx={{ width: 3, height: 20, borderRadius: "5px", backgroundColor: "#2563EB", flexShrink: 0 }} />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: "#111827", lineHeight: 1.35 }}>
                                        Teaching Staff
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.1 }}>
                                        {uploadedCount} of {filteredData.length} have a timetable uploaded
                                    </Typography>
                                </Box>
                            </Box>

                            <TextField
                                variant="outlined"
                                placeholder="Search by name or employee code"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 17, color: "#8A93A0" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.2 }}>
                                                    <HighlightOffIcon sx={{ fontSize: 15, color: "#8A93A0" }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                        sx: {
                                            padding: "0 10px",
                                            borderRadius: "50px",
                                            height: "28px",
                                            fontSize: "12px",
                                        },
                                    },
                                }}
                                sx={{
                                    width: { xs: "100%", sm: 300 },
                                    "& .MuiOutlinedInput-root": {
                                        minHeight: "28px",
                                        paddingRight: "3px",
                                        backgroundColor: "#fff",
                                    },
                                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#DDE1E6",
                                    },
                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: websiteSettings.mainColor,
                                    },
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>

                        {filteredData.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: "center" }}>
                                <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                                    {searchQuery ? "No teachers match your search" : "No teaching staff found"}
                                </Typography>
                                <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5 }}>
                                    {searchQuery
                                        ? "Try a different name or employee code."
                                        : "Once staff records exist they will be listed here."}
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", maxHeight: "66vh" }}>
                                <Table stickyHeader sx={{ minWidth: 900 }}>
                                    <TableHead>
                                        <TableRow>
                                            {["S.No", "Employee Code", "Name", "Photo", "Timetable", "Preview", "Delete", "Save"].map(
                                                (header) => (
                                                    <TableCell key={header} sx={headCellSx}>
                                                        {header}
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredData.map((row, index) => {
                                            const hasTimetable = Boolean(row.preView);
                                            const staged = uploadedFiles && uploadedFiles.name && stagedFor === row.employeeCode;
                                            return (
                                                <TableRow
                                                    key={row.employeeCode}
                                                    sx={{
                                                        transition: "background-color 0.15s",
                                                        "&:hover": { backgroundColor: "#FAFBFC" },
                                                    }}
                                                >
                                                    <TableCell sx={bodyCellSx}>
                                                        <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={bodyCellSx}>
                                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#374151" }}>
                                                            {row.employeeCode}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ ...bodyCellSx, textAlign: "left" }}>
                                                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                                                            {row.name}
                                                        </Typography>
                                                        <Box sx={{ mt: 0.4 }}>
                                                            <Chip
                                                                size="small"
                                                                label={hasTimetable ? "Uploaded" : "Not uploaded"}
                                                                sx={{
                                                                    height: "18px",
                                                                    fontSize: "10px",
                                                                    fontWeight: 700,
                                                                    borderRadius: "6px",
                                                                    backgroundColor: hasTimetable ? "#ECFDF5" : "#F3F4F6",
                                                                    color: hasTimetable ? "#059669" : "#6B7280",
                                                                }}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={bodyCellSx}>
                                                        <Button
                                                            startIcon={<ImageIcon sx={{ fontSize: 16 }} />}
                                                            sx={{
                                                                color: "#374151",
                                                                textTransform: "none",
                                                                fontSize: "12px",
                                                                fontWeight: 600,
                                                                borderRadius: "50px",
                                                                py: 0.2,
                                                            }}
                                                            onClick={() => handleViewClick(row.photo)}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell sx={bodyCellSx}>
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<UploadFileIcon sx={{ fontSize: 15 }} />}
                                                            sx={{
                                                                border: "1px solid #D6DAE1",
                                                                width: "150px",
                                                                fontSize: "12px",
                                                                fontWeight: 600,
                                                                py: 0.2,
                                                                color: "#374151",
                                                                backgroundColor: "#fff",
                                                                textTransform: "none",
                                                                borderRadius: "50px",
                                                                "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#F7F8FA" },
                                                            }}
                                                            onClick={() => handleUploadClick(row.employeeCode)}
                                                        >
                                                            {hasTimetable ? "Reupload Image" : "Upload Image"}
                                                        </Button>

                                                        <input
                                                            type="file"
                                                            ref={(el) => { fileInputRefs.current[row.employeeCode] = el; }}
                                                            onChange={(e) => handleFileChange(e, row.employeeCode)}
                                                            style={{ display: "none" }}
                                                            accept=".jpg, .jpeg, .webp, .png"
                                                        />

                                                        {staged && (
                                                            <Typography sx={{
                                                                fontSize: "10.5px",
                                                                color: "#059669",
                                                                fontWeight: 600,
                                                                mt: 0.4,
                                                                maxWidth: 150,
                                                                mx: "auto",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}>
                                                                {uploadedFiles.name} ready
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={bodyCellSx}>
                                                        <Button
                                                            sx={{
                                                                color: "#E60154",
                                                                textTransform: "none",
                                                                borderRadius: "50px",
                                                                py: 0.2,
                                                                fontSize: "12px",
                                                                fontWeight: 600,
                                                                backgroundColor: "#fcf6f0",
                                                                "&.Mui-disabled": { backgroundColor: "#F3F4F6", color: "#9AA3AF" },
                                                            }}
                                                            disabled={!hasTimetable}
                                                            onClick={() => handlePreview(row.preView)}
                                                        >
                                                            View Image
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell sx={bodyCellSx}>
                                                        <Tooltip title={hasTimetable ? "Delete timetable" : "Nothing to delete"}>
                                                            <span>
                                                                <IconButton
                                                                    onClick={() => handleDelete(row.employeeCode)}
                                                                    disabled={!hasTimetable}
                                                                    sx={smallIconSx}
                                                                >
                                                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 15, color: hasTimetable ? "#f44336" : "#9AA3AF" }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell sx={bodyCellSx}>
                                                        <Button
                                                            onClick={() => (hasTimetable ? UpdateData(row.employeeCode) : savePostData(row.employeeCode))}
                                                            sx={{
                                                                color: websiteSettings.textColor,
                                                                textTransform: "none",
                                                                backgroundColor: websiteSettings.mainColor,
                                                                py: 0.2,
                                                                borderRadius: "50px",
                                                                fontSize: "12px",
                                                                fontWeight: 700,
                                                                minWidth: "78px",
                                                                boxShadow: "none",
                                                                "&:hover": { backgroundColor: websiteSettings.mainColor, opacity: 0.9 },
                                                            }}
                                                        >
                                                            {hasTimetable ? "Update" : "Save"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ═══ Staff photo lightbox ═══ */}
            <Dialog
                open={openImage}
                onClose={() => setOpenImage(false)}
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& .MuiPaper-root': {
                        backgroundColor: 'transparent', boxShadow: 'none', borderRadius: 0,
                        padding: 0, overflow: 'visible', maxWidth: '90vw', maxHeight: '90vh',
                    },
                }}
                BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
            >
                <Box sx={{ position: 'relative' }}>
                    <img
                        src={selectedImage}
                        alt="Staff"
                        style={{ width: 'auto', height: 'auto', maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: 'auto', borderRadius: '10px' }}
                    />
                    <IconButton
                        onClick={handleImageClose}
                        sx={{
                            position: 'absolute', top: 8, right: 8, color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.45)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </Dialog>

            {/* ═══ Timetable lightbox ═══ */}
            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& .MuiPaper-root': {
                        backgroundColor: 'transparent', boxShadow: 'none', borderRadius: 0,
                        padding: 0, overflow: 'visible', maxWidth: '90vw', maxHeight: '90vh',
                    },
                }}
                BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
            >
                <Box sx={{ position: 'relative' }}>
                    <img
                        src={selectedPreviewImage}
                        alt="Timetable"
                        style={{ width: 'auto', height: 'auto', maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: 'auto', borderRadius: '10px' }}
                    />
                    <IconButton
                        onClick={handleImageClose1}
                        sx={{
                            position: 'absolute', top: 8, right: 8, color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.45)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </Dialog>

            {/* ═══ Delete confirmation ═══ */}
            <Dialog
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        Delete this timetable?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        The uploaded timetable for this staff member will be removed. This cannot be undone.
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                        <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={ghostButtonSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleCloseDialog(true)}
                            sx={{
                                ...primaryButtonSx,
                                backgroundColor: "#f44336",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}