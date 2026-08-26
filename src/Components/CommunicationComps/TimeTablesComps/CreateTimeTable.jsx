import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Chip, Divider, IconButton, Dialog, DialogActions, Autocomplete, Paper, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { GettingGrades, postMessage, postNews, postTimeTable, sectionsDropdown, TimeTableFetch } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

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
    const academicYear = useSelector(selectAcademicYear);
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
    // Object URLs must be revoked or every re-pick leaks one.
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const file = uploadedFiles[0];
        if (!file) {
            setPreviewUrl('');
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [uploadedFiles]);

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
            sendData.append("gradeId", selectedGradeId);
            sendData.append("section", selectedSection);
            sendData.append("userType", userType);
            sendData.append("rollNumber", rollNumber);
            sendData.append("fileType", "image");
            sendData.append("file", uploadedFiles[0] || '');
            sendData.append("status", status);
            sendData.append("postedOn", todayDateTime);
            sendData.append("draftedOn", status === 'draft' ? todayDateTime : "");

            sendData.append("academicYear", academicYear || "");

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
            setChangesHappended(false);
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
        "&.Mui-disabled": { backgroundColor: "#E5E7EB", color: "#9AA3AF" },
    };

    const dropdownInputSx = {
        paddingRight: 0,
        height: "38px",
        fontSize: "13px",
        fontWeight: 600,
        backgroundColor: "#fff",
        borderRadius: "8px",
    };

    const selectedFile = uploadedFiles[0] || null;
    const isReady = Boolean(selectedGradeId && selectedSection && selectedFile);

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
                justifyContent: "space-between",
                width: "100%",
                borderBottom: "1px solid #ddd",
                px: 2,
                py: 1.5,
                marginTop: "-2px"
            }}>
                <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Time Tables</Typography>
                </Box>

                <Chip
                    size="small"
                    icon={<GroupsOutlinedIcon sx={{ fontSize: 16 }} />}
                    label="Students"
                    sx={{
                        mr: 2,
                        display: { xs: "none", sm: "inline-flex" },
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "1px solid #CBE3B4",
                        backgroundColor: "#F1F8E9",
                        color: "#4E7A2E",
                        "& .MuiChip-icon": { color: "inherit" },
                    }}
                />
            </Box>

            <Grid container>
                {/* ── FORM COLUMN ── */}
                <Grid
                    mt={2}
                    p={2}
                    size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Box sx={{
                        border: "1px solid #E6E8EC",
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        mt: 4.5,
                        maxHeight: "75.6vh",
                        overflow: "hidden auto",
                        "& *": { maxWidth: "100%" },
                    }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.2,
                            p: 1.5,
                            mb: 2.5,
                            borderRadius: "10px",
                            border: "1px solid #DCEDC8",
                            backgroundColor: "#F5FAF0",
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 18, color: "#4E7A2E", mt: "1px" }} />
                            <Box>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#4E7A2E" }}>
                                    One timetable image per class and section
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#5B6472", mt: 0.2 }}>
                                    Students in the selected section will see this as soon as you publish.
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                <Typography sx={fieldLabelSx}>
                                    Class <span style={requiredSx}>*</span>
                                </Typography>
                                <Autocomplete
                                    disablePortal
                                    options={grades}
                                    getOptionLabel={(option) => option.sign}
                                    value={grades.find((item) => item.id === selectedGradeId) || null}
                                    onChange={(event, newValue) => handleGradeChange(newValue)}
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
                                            placeholder="Select class"
                                            error={gradeError}
                                            helperText={gradeError ? "Pick a class" : ""}
                                            slotProps={{ input: { ...params.InputProps, sx: dropdownInputSx } }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                <Typography sx={fieldLabelSx}>
                                    Section <span style={requiredSx}>*</span>
                                </Typography>
                                <Autocomplete
                                    disablePortal
                                    disabled={!selectedGrade}
                                    options={sections}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={sections.find((option) => option.sectionName === selectedSection) || null}
                                    onChange={handleSectionChange}
                                    isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
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
                                            placeholder={selectedGrade ? "Select section" : "Pick a class first"}
                                            error={sectionError}
                                            helperText={sectionError ? "Pick a section" : ""}
                                            slotProps={{ input: { ...params.InputProps, sx: dropdownInputSx } }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{
                            backgroundColor: "#FAFBFC",
                            border: `1px solid ${fileError ? "#F5C2C2" : "#EDEFF3"}`,
                            borderRadius: "10px",
                            p: 1.5,
                            mt: 2.5,
                        }}>
                            <Typography sx={fieldLabelSx}>
                                Timetable image <span style={requiredSx}>*</span>
                            </Typography>

                            <Box
                                {...getRootProps()}
                                sx={{
                                    border: isDragActive ? "2px dashed #1976d2" : "2px dashed #C7D6EA",
                                    borderRadius: "10px",
                                    p: 2,
                                    backgroundColor: isDragActive ? "#E3F2FD" : "#F6F9FD",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "0.2s",
                                    "&:hover": { borderColor: "#1976d2", backgroundColor: "#EDF4FC" },
                                }}
                            >
                                <input {...getInputProps()} accept=".jpg, .jpeg, .webp, .png" />
                                <UploadFileIcon sx={{ fontSize: 32, color: "#1976d2" }} />
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mt: 0.5 }}>
                                    Drag and drop the timetable here, or click to upload
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: "#8A93A0", mt: 0.2 }}>
                                    JPG, JPEG, WebP or PNG · max 25MB
                                </Typography>
                            </Box>

                            {selectedFile && (
                                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{
                                        width: 74, height: 74, flexShrink: 0,
                                        border: "1px solid #E6E8EC",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        backgroundColor: "#fff",
                                    }}>
                                        <img
                                            src={previewUrl}
                                            alt="Selected timetable"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#374151" }} noWrap>
                                            {selectedFile.name || "Selected image"}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>
                                            {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={handleImageClose}
                                            startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                                            sx={{
                                                textTransform: "none", fontSize: "11.5px", fontWeight: 600,
                                                color: "#f44336", px: 0.5, mt: 0.2,
                                                "&:hover": { backgroundColor: "#FEF2F2" },
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {fileError && !selectedFile && (
                                <Typography sx={{ fontSize: "11.5px", color: "#f44336", mt: 1 }}>
                                    A timetable image is required.
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ mt: 3 }} />
                        <Box sx={{
                            mt: 2,
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
                                startIcon={<PublishOutlinedIcon sx={{ fontSize: 17 }} />}
                                sx={primaryButtonSx}
                                disabled={!isReady}
                                onClick={() => handleInsertMessageData('post')}
                            >
                                Publish
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                {/* ── PREVIEW COLUMN ── */}
                <Grid
                    sx={{ py: 2, mt: 6.5, pr: 2 }}
                    size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Box sx={{
                        border: "1px solid #E6E8EC",
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        height: "75.6vh",
                        overflow: "hidden auto",
                    }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Live Preview</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>Updates as you choose</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />

                        {!selectedFile && !selectedGradeId ? (
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
                                    Pick a class and upload the timetable — it will show up here straight away.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {/* The card as it appears on the Time Tables listing */}
                                <Box sx={{
                                    border: "1px solid #E6E8EC",
                                    boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                    borderRadius: "5px",
                                    backgroundColor: "#fff",
                                    overflow: "hidden",
                                    maxWidth: 420,
                                }}>
                                    <Box sx={{ p: 2, pb: 1.2 }}>
                                        <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                            {selectedGrade
                                                ? `${selectedGrade.sign}${selectedSection ? ` - ${selectedSection}` : ""}`
                                                : "Class not selected"}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", color: "#777" }}>
                                            Posted on {todayDateTime}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        mx: 2, mb: 2,
                                        borderRadius: "5px",
                                        overflow: "hidden",
                                        border: "1px solid #EDEFF3",
                                        backgroundColor: "#F7F8FA",
                                        minHeight: 190,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Timetable preview"
                                                style={{ width: "100%", height: "190px", objectFit: "cover", display: "block" }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontSize: "12px", color: "#9AA3AF", py: 6 }}>
                                                No image uploaded yet
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {!isReady && (
                                    <Box sx={{
                                        display: "flex", alignItems: "flex-start", gap: 0.9,
                                        mt: 2, px: 1.2, py: 1,
                                        borderRadius: "8px",
                                        backgroundColor: "#FAFBFC",
                                        border: "1px dashed #E6E8EC",
                                        maxWidth: 420,
                                    }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 15, color: "#9AA3AF", mt: "1px" }} />
                                        <Typography sx={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.5 }}>
                                            {!selectedGradeId
                                                ? "Pick a class to continue."
                                                : !selectedSection
                                                    ? "Pick a section to continue."
                                                    : "Upload the timetable image to enable Publish."}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* ═══ Discard confirmation ═══ */}
            <Dialog
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        Discard this timetable?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        Your changes have not been saved yet and will be lost.
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                        <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={{ ...ghostButtonSx, px: 2.4 }}>
                            Keep editing
                        </Button>
                        <Button onClick={() => handleCloseDialog(true)} sx={primaryButtonSx}>
                            Discard
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}