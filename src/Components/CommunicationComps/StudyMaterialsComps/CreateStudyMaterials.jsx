import React, { useEffect, useRef, useState, useMemo } from "react";
import { Divider, Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogContent, DialogActions, Autocomplete, Paper, Stack, Tooltip, FormControl, Select, OutlinedInput, MenuItem, Checkbox, Chip } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { deleteStudyMaterialFolder, getStudyMaterialFoldersByGrade, GettingGrades, postHomeWork, postMessage, postNews, poststudyMaterial, postStudyMaterialFolder, postTimeTable, sectionsDropdown, TimeTableFetch } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import { head } from "lodash";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Loader from "../../Loader";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";

export default function CreateStudyMaterialsPage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const token = "123";
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    // Adding or removing a study-material folder is a create action on the module.
    const studyPerms = findSubMenuPermissions(user.permissions, "communication", "studymaterial") || {};
    const canManageFolders = studyPerms.create === "Y";
    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);
    const [sectionError, setSectionError] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [gradeError, setGradeError] = useState(false);
    const [DTValue, setDTValue] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [fileType, setFileType] = useState("");
    const [subjectOptions, setSubjectOptions] = useState(grades[0].subjects || []);
    const [heading, setHeading] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [openFolderPopup, setOpenFolderPopup] = useState(false);
    const [openFolderPopup1, setOpenFolderPopup1] = useState(false);
    const [deleteId, setDeleteId] = useState("");
    const [folderName, setFolderName] = useState("");
    const [value, setValue] = useState(0);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedSectionIds, setSelectedSectionIds] = useState([]);

    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];

    const allSectionNames = sections.map((section) => section.sectionName);
    const isAllSelected = selectedSectionIds.length === allSectionNames.length;

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleCreateFolder = () => {
        if (selectedGrade) {
            setOpenFolderPopup(true);
        }
    };

    const handleCreateFolderClose = () => {
        setOpenFolderPopup(false);
        setFolderName("");
        setValue(0)
    };

    const onRemove = (id) => {
        setDeleteId(id)
        setOpenFolderPopup1(true);
    };

    const handleRemoveFolderClose = (deleted) => {
        setOpenFolderPopup1(false);
        if (deleted) {
            setOpenFolderPopup1(false);
            deleteFolder(deleteId)
        }
    };

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue?.id || null);
            setSelectedSection(null);
            const combinedSubjects = [
                ...(newValue.primarySubjects || []),
                ...(newValue.secondarySubjects || []),
            ];

            setSubjectOptions(combinedSubjects);
            setGradeError(false);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
            setSubjectOptions([]);
        }
    };

    const handleSectionChange = (event) => {
        const { value } = event.target;
        if (value.includes("all")) {
            if (isAllSelected) {
                setSelectedSectionIds([]);
            } else {
                setSelectedSectionIds(allSectionNames);
            }
        } else {
            setSelectedSectionIds(value);
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
    const handleHeadingChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
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
        fetchFolder()
    }, [selectedGrade])

    const fetchFolder = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getStudyMaterialFoldersByGrade, {
                params: {
                    gradeId: selectedGradeId,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFolders(res.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitCreateFolder = async (status) => {
        setIsLoading(true);

        try {
            const sendData = {
                folderName: folderName,
                gradeId: String(selectedGradeId),
            };

            const res = await axios.post(postStudyMaterialFolder, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Folder created successfully.");
            handleCreateFolderClose();
            fetchFolder()
        } catch (error) {
            setMessage("An error occurred while creating the message.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteFolder = async (folderName) => {
        setIsLoading(true);

        try {
            const response = await axios.delete(deleteStudyMaterialFolder, {
                data: {
                    folderName,
                    gradeId: String(selectedGradeId),
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Folder deleted successfully.");
            setStatus(true);
            setColor(true);
            setOpen(true);

            fetchFolder();
        } catch (error) {
            setMessage("Failed to delete folder. Please try again.");
            setStatus(false);
            setColor(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = async (submitStatus) => {

        if (!heading || !selectedGradeId || !selectedSectionIds || !selectedSubject || uploadedFiles.length === 0) {
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
            selectedSectionIds.forEach(section => {
                sendData.append("section", section);
            });
            sendData.append("userType", userType);
            sendData.append("rollNumber", rollNumber);
            sendData.append("subject", selectedSubject);
            sendData.append("heading", heading);
            sendData.append("folder", selectedFolder);
            sendData.append("fileType", fileType || "");
            sendData.append("file", uploadedFiles[0] || '');
            sendData.append("status", submitStatus);
            sendData.append("postedOn", submitStatus === 'post' ? todayDateTime : "");
            sendData.append("draftedOn", submitStatus === 'draft' ? todayDateTime : "");

            sendData.append("academicYear", academicYear || "");

            const res = await axios.post(poststudyMaterial, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Data Added successfully");
            setOpen(true);
            setColor(true);
            setStatus(true);

            setSelectedGradeId(null)
            setSelectedSectionIds([]);
            setSelectedSubject("")
            setSelectedFolder([])
            setHeading("")
            setUploadedFiles([])

        } catch (error) {
            setMessage("Error while inserting data");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };


    const mainColor = websiteSettings.mainColor || DASH.primary;

    const fieldLabelSx = { fontSize: "12.5px", fontWeight: 600, color: DASH.text, mb: 0.6 };
    const requiredSx = { color: "#E30053" };

    // One shape for every control on this form - the heights used to run
    // 33px / 34px / 40px side by side, so nothing lined up.
    const inputSx = {
        width: "100%",
        "& .MuiOutlinedInput-root": {
            height: 36,
            fontSize: "13px",
            borderRadius: RADIUS,
            bgcolor: "#fff",
            "& fieldset": { borderColor: DASH.line },
            "&:hover fieldset": { borderColor: DASH.faint },
            "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
        },
        "& .MuiOutlinedInput-input": { padding: "0 10px" },
    };

    const ghostBtnSx = {
        textTransform: "none",
        fontSize: "12.5px",
        fontWeight: 600,
        color: DASH.text,
        bgcolor: "#fff",
        border: `1px solid ${DASH.line}`,
        borderRadius: RADIUS,
        px: 2,
        height: 34,
        boxShadow: "none",
        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
    };

    const primaryBtnSx = {
        textTransform: "none",
        fontSize: "12.5px",
        fontWeight: 700,
        color: websiteSettings.textColor || "#fff",
        bgcolor: mainColor,
        borderRadius: RADIUS,
        px: 2.4,
        height: 34,
        boxShadow: "none",
        "&:hover": { bgcolor: mainColor, filter: "brightness(0.92)", boxShadow: "none" },
        "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
    };

    const blackPaper = (props) => (
        <Paper {...props} style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff" }} />
    );

    const summaryChips = [
        selectedGrade?.sign,
        selectedSectionIds.length ? selectedSectionIds.join(", ") : null,
        selectedSubject || null,
        selectedFolder || null,
    ].filter(Boolean);

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* ═══ HEADER — same bar as Create News ═══ */}
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                py: 1.5,
                borderBottom: "1px solid #ddd",
                px: 2,
                marginTop: "-2px",
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/studymaterials">
                        <IconButton sx={{ width: "27px", height: "27px", marginTop: "2px" }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                    </Link>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px", ml: 0.5 }}>Create Study Material</Typography>
                </Box>

                <Chip
                    size="small"
                    icon={<FolderOutlinedIcon sx={{ fontSize: 15 }} />}
                    label={selectedFolder ? `Filing into ${selectedFolder}` : "No folder chosen yet"}
                    sx={{
                        mr: 4,
                        display: { xs: "none", sm: "inline-flex" },
                        height: 26,
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: RADIUS,
                        border: `1px solid ${selectedFolder ? "#CBE3B4" : DASH.line}`,
                        backgroundColor: selectedFolder ? "#F1F8E9" : "#fff",
                        color: selectedFolder ? "#4E7A2E" : DASH.muted,
                        "& .MuiChip-icon": { color: "inherit" },
                    }}
                />
            </Box>

            <Grid container>
                {/* ═══ FORM ═══ */}
                <Grid mt={2} p={2} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Box sx={{
                        border: `1px solid ${DASH.line}`,
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        mt: 4.5,
                        maxHeight: "75.6vh",
                        overflow: "hidden auto",
                    }}>
                        <Grid container spacing={1.8}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Typography sx={fieldLabelSx}>Class <span style={requiredSx}>*</span></Typography>
                                <Autocomplete
                                    disablePortal
                                    size="small"
                                    options={grades}
                                    getOptionLabel={(option) => option.sign}
                                    value={grades.find((item) => item.id === selectedGradeId) || null}
                                    onChange={(event, newValue) => handleGradeChange(newValue)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    PaperComponent={blackPaper}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">{option.sign}</li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth placeholder="Select class" sx={inputSx} />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Typography sx={fieldLabelSx}>Sections <span style={requiredSx}>*</span></Typography>
                                <FormControl sx={{ width: "100%" }}>
                                    <Select
                                        multiple
                                        disabled={!selectedGrade}
                                        displayEmpty
                                        value={selectedSectionIds}
                                        onChange={handleSectionChange}
                                        input={<OutlinedInput />}
                                        renderValue={(selected) =>
                                            selected.length === 0
                                                ? <Typography sx={{ color: DASH.faint, fontSize: "13px" }}>Select sections</Typography>
                                                : selected.join(", ")
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 250,
                                                    overflow: "auto",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
                                                    "& .MuiMenuItem-root": { fontSize: "14px" },
                                                },
                                            },
                                        }}
                                        sx={{
                                            height: 36,
                                            fontSize: "13px",
                                            borderRadius: RADIUS,
                                            bgcolor: "#fff",
                                            "& fieldset": { borderColor: DASH.line },
                                            "&:hover fieldset": { borderColor: DASH.faint },
                                            "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
                                        }}
                                    >
                                        <MenuItem value="all">
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={selectedSectionIds.length > 0 && !isAllSelected}
                                                sx={{ color: "#fff", padding: "0 5px", "&.Mui-checked": { color: "#fff" } }}
                                            />
                                            <Typography sx={{ fontSize: "14px", color: "#fff" }}>Select All</Typography>
                                        </MenuItem>

                                        {sections.map((section) => (
                                            <MenuItem key={section.sectionName} value={section.sectionName}>
                                                <Checkbox
                                                    checked={selectedSectionIds.includes(section.sectionName)}
                                                    sx={{ padding: "0 5px", color: "#fff", "&.Mui-checked": { color: "#fff" } }}
                                                />
                                                <Typography sx={{ fontSize: "14px", ml: 1, color: "#fff" }}>
                                                    {section.sectionName}
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Typography sx={fieldLabelSx}>Subject <span style={requiredSx}>*</span></Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    placeholder="e.g. Mathematics"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    sx={inputSx}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Typography sx={fieldLabelSx}>Folder <span style={requiredSx}>*</span></Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Autocomplete
                                        disabled={!selectedGradeId}
                                        disablePortal
                                        size="small"
                                        options={folders}
                                        getOptionLabel={(option) => option.folderName || ""}
                                        value={selectedFolder ? folders.find((f) => f.folderName === selectedFolder) || null : null}
                                        onChange={(event, newValue) => setSelectedFolder(newValue ? newValue.folderName : null)}
                                        isOptionEqualToValue={(option, value) => option.folderName === value.folderName}
                                        PaperComponent={blackPaper}
                                        renderOption={(props, option) => (
                                            <li {...props} className="classdropdownOptions">{option.folderName}</li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField {...params} fullWidth placeholder="Select folder" sx={inputSx} />
                                        )}
                                        sx={{ flex: 1, minWidth: 0 }}
                                    />
                                    {canManageFolders && (
                                        <Tooltip title={selectedGrade ? "Add or remove folders" : "Pick a class first"} arrow>
                                            <span>
                                                <IconButton
                                                    disabled={!selectedGrade}
                                                    onClick={handleCreateFolder}
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        flexShrink: 0,
                                                        borderRadius: RADIUS,
                                                        border: `1px solid ${DASH.line}`,
                                                        bgcolor: "#fff",
                                                        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                                    }}
                                                >
                                                    <CreateNewFolderOutlinedIcon sx={{ fontSize: 17, color: selectedGrade ? DASH.text : DASH.faint }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Typography sx={fieldLabelSx}>Heading <span style={requiredSx}>*</span></Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    placeholder="A short, clear title for this material"
                                    value={heading}
                                    onChange={handleHeadingChange}
                                    sx={inputSx}
                                />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                                    <Typography sx={{ fontSize: "11px", color: "#E30053" }}>
                                        {isSubmitted && !heading.trim() ? "This field is required" : ""}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: heading.length >= 100 ? "#E30053" : DASH.faint }}>
                                        {`${heading.length}/100`}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Typography sx={fieldLabelSx}>File <span style={requiredSx}>*</span></Typography>
                                <Box
                                    {...getRootProps()}
                                    sx={{
                                        border: `1.5px dashed ${isDragActive ? mainColor : DASH.line}`,
                                        borderRadius: RADIUS,
                                        py: 2.4,
                                        px: 2,
                                        bgcolor: isDragActive ? `${mainColor}0D` : DASH.surface,
                                        textAlign: "center",
                                        cursor: "pointer",
                                        transition: "border-color .2s ease, background-color .2s ease",
                                        "&:hover": { borderColor: mainColor, bgcolor: `${mainColor}08` },
                                    }}
                                >
                                    <input {...getInputProps()} accept=".jpg, .jpeg, .webp, .png, .pdf" />
                                    <UploadFileIcon sx={{ fontSize: 30, color: DASH.faint }} />
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.text, mt: 0.6 }}>
                                        Drag a file here, or click to browse
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: DASH.faint, mt: 0.3 }}>
                                        JPG, JPEG, WebP, PNG or PDF · up to 25MB
                                    </Typography>
                                </Box>

                                {uploadedFiles.length > 0 && (
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.4,
                                        mt: 1.4,
                                        p: 1.2,
                                        borderRadius: RADIUS,
                                        border: `1px solid ${DASH.line}`,
                                        bgcolor: "#fff",
                                    }}>
                                        {fileType === "image" ? (
                                            <Box
                                                component="img"
                                                src={filePreviewUrl}
                                                alt="Selected"
                                                sx={{ width: 44, height: 44, borderRadius: RADIUS, objectFit: "cover", border: `1px solid ${DASH.line}`, flexShrink: 0 }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                width: 44, height: 44, flexShrink: 0, borderRadius: RADIUS,
                                                bgcolor: "#FEF2F2", border: "1px solid #FECACA",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: DASH.red }} />
                                            </Box>
                                        )}
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }} noWrap>
                                                {uploadedFiles[0].name || "Selected file"}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>
                                                {fileType === "image" ? "Image" : "PDF"} · ready to publish
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" onClick={handleImageClose} sx={{ flexShrink: 0 }}>
                                            <CancelIcon sx={{ fontSize: 18, color: DASH.faint }} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        {/* ═══ ACTIONS ═══ */}
                        <Divider sx={{ mt: 2.5 }} />
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mt: 2 }}>
                            <Button
                                startIcon={<CloseOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={ghostBtnSx}
                                onClick={() => navigate("/dashboardmenu/studymaterials")}
                            >
                                Cancel
                            </Button>
                            <Button
                                startIcon={<PublishOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={primaryBtnSx}
                                onClick={() => handleSubmit("post")}
                            >
                                Publish
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                {/* ═══ PREVIEW ═══ */}
                <Grid sx={{ py: 2, mt: 6.5, pr: 2 }} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Box sx={{
                        border: `1px solid ${DASH.line}`,
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        height: "75.6vh",
                        overflow: "hidden auto",
                    }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18, color: DASH.muted }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: DASH.text }}>Live Preview</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>Updates as you type</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />

                        {!heading && !filePreviewUrl && summaryChips.length === 0 ? (
                            <Box sx={{
                                height: "60vh",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                textAlign: "center",
                            }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 34, color: "#C9CFD8" }} />
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.muted }}>
                                    Nothing to preview yet
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: DASH.faint, maxWidth: 260 }}>
                                    Start typing the title or pick a file and it will show up here straight away.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {summaryChips.length > 0 && (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mb: 1.4 }}>
                                        {summaryChips.map((chip) => (
                                            <Chip
                                                key={chip}
                                                size="small"
                                                label={chip}
                                                sx={{
                                                    height: 20,
                                                    fontSize: "10.5px",
                                                    fontWeight: 700,
                                                    borderRadius: RADIUS,
                                                    bgcolor: `${mainColor}14`,
                                                    color: mainColor,
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}

                                {heading && (
                                    <Typography sx={{ fontWeight: 700, fontSize: "16px", color: DASH.ink, wordBreak: "break-word" }}>
                                        {heading}
                                    </Typography>
                                )}

                                {filePreviewUrl && fileType === "image" && (
                                    <Box sx={{ pt: 1.5 }}>
                                        <img
                                            src={filePreviewUrl}
                                            alt="Study material"
                                            style={{
                                                width: "273px",
                                                height: "210px",
                                                objectFit: "cover",
                                                maxWidth: "100%",
                                                borderRadius: "10px",
                                                border: `1px solid ${DASH.line}`,
                                                display: "block",
                                            }}
                                        />
                                    </Box>
                                )}

                                {filePreviewUrl && fileType !== "image" && (
                                    <Box sx={{
                                        display: "flex", alignItems: "center", gap: 1.2, mt: 1.5, p: 1.4,
                                        borderRadius: RADIUS, border: `1px solid ${DASH.line}`, bgcolor: DASH.surface,
                                    }}>
                                        <PictureAsPdfOutlinedIcon sx={{ fontSize: 22, color: DASH.red }} />
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.text }} noWrap>
                                            {uploadedFiles[0]?.name || "PDF attached"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* ═══ FOLDER MANAGER ═══ */}
            <Dialog
                maxWidth="xs"
                fullWidth
                open={openFolderPopup}
                onClose={handleCreateFolderClose}
                slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
            >
                <Box sx={{ height: 3, bgcolor: mainColor }} />
                <Box sx={{ px: 2, py: 1.6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                        <Box sx={{
                            width: 34, height: 34, flexShrink: 0, borderRadius: RADIUS,
                            bgcolor: `${mainColor}14`, border: `1px solid ${mainColor}33`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <FolderOutlinedIcon sx={{ fontSize: 18, color: mainColor }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                Folders
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                {selectedGrade?.sign ? `For class ${selectedGrade.sign}` : "For this class"}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={handleCreateFolderClose}>
                        <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", gap: 0.5, px: 2, borderTop: `1px solid ${DASH.line}`, borderBottom: `1px solid ${DASH.line}` }}>
                        {["Add Folder", "Remove Folder"].map((label, index) => (
                            <Box
                                key={label}
                                onClick={() => setValue(index)}
                                sx={{
                                    px: 1.6, py: 1.1, cursor: "pointer",
                                    fontSize: "12.5px", fontWeight: 700,
                                    color: value === index ? mainColor : DASH.muted,
                                    borderBottom: value === index ? `2px solid ${mainColor}` : "2px solid transparent",
                                    mb: "-1px",
                                }}
                            >
                                {label}
                            </Box>
                        ))}
                    </Box>

                    {value === 0 && (
                        <Box sx={{ p: 2 }}>
                            <Typography sx={fieldLabelSx}>Folder name <span style={requiredSx}>*</span></Typography>
                            <TextField
                                type="text"
                                size="small"
                                fullWidth
                                placeholder="e.g. Term 1 Notes"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                inputProps={{ maxLength: 30 }}
                                sx={inputSx}
                            />
                            <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.5 }}>
                                {`${folderName.length}/30`}
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1.5 }}>
                                <Button sx={ghostBtnSx} onClick={handleCreateFolderClose}>Cancel</Button>
                                <Button disabled={!folderName.trim()} sx={primaryBtnSx} onClick={handleSubmitCreateFolder}>
                                    Add Folder
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {value === 1 && (
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: DASH.muted }}>
                                    Folder names
                                </Typography>
                                <Tooltip
                                    title={<Typography sx={{ fontSize: 12, maxWidth: 200 }}>Removing a folder also deletes every file inside it.</Typography>}
                                    placement="left"
                                    arrow
                                >
                                    <IconButton size="small" sx={{ p: 0, color: DASH.faint }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, overflow: "hidden" }}>
                                {!folders || folders.length === 0 ? (
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.faint, textAlign: "center", py: 3 }}>
                                        No folders in this class yet.
                                    </Typography>
                                ) : (
                                    <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                                        {folders.map((folder) => (
                                            <Stack
                                                key={folder.id}
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                sx={{
                                                    px: 1.4, py: 1,
                                                    borderBottom: `1px solid ${DASH.lineSoft}`,
                                                    "&:last-of-type": { borderBottom: "none" },
                                                    "&:hover": { bgcolor: DASH.surface },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                                    <FolderOutlinedIcon sx={{ fontSize: 16, color: DASH.faint, flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: "12.5px", color: DASH.ink }} noWrap>
                                                        {folder.folderName}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRemove(folder.folderName)}
                                                    sx={{ color: DASH.faint, "&:hover": { color: DASH.red } }}
                                                >
                                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1.5 }}>
                                <Button sx={ghostBtnSx} onClick={handleCreateFolderClose}>Close</Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══ DELETE CONFIRM ═══ */}
            <Dialog
                open={openFolderPopup1}
                onClose={() => handleRemoveFolderClose(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
            >
                <Box sx={{ height: 3, bgcolor: DASH.red }} />
                <Box sx={{ p: 2.4, textAlign: "center" }}>
                    <Box sx={{
                        width: 40, height: 40, mx: "auto", borderRadius: RADIUS,
                        bgcolor: DASH.redLight, border: "1px solid #FECACA",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 21, color: DASH.red }} />
                    </Box>
                    <Typography sx={{ fontSize: "15.5px", fontWeight: 700, color: DASH.ink, mt: 1.4 }}>
                        Delete this folder?
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, lineHeight: 1.6 }}>
                        Every file inside it is removed too. This cannot be undone.
                    </Typography>
                    <DialogActions sx={{ justifyContent: "center", pt: 2.4, gap: 1 }}>
                        <Button sx={ghostBtnSx} onClick={() => handleRemoveFolderClose(false)}>Cancel</Button>
                        <Button
                            sx={{ ...primaryBtnSx, bgcolor: DASH.red, color: "#fff", "&:hover": { bgcolor: "#DC2626", boxShadow: "none" } }}
                            onClick={() => handleRemoveFolderClose(true)}
                        >
                            Yes, delete
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}