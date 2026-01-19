import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, createTheme, ThemeProvider, Stack, Tabs, Tab, Tooltip, FormControl, Select, OutlinedInput, MenuItem, Checkbox, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { deleteStudyMaterialFolder, getStudyMaterialFoldersByGrade, GettingGrades, postHomeWork, postMessage, postNews, poststudyMaterial, postStudyMaterialFolder, postTimeTable, sectionsDropdown, TimeTableFetch } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { head } from "lodash";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Loader from "../../Loader";

export default function CreateStudyMaterialsPage() {
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
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const websiteSettings = useSelector(selectWebsiteSettings);
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
        fetchFolder()
    }, [selectedGrade])

    const fetchFolder = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getStudyMaterialFoldersByGrade, {
                params: {
                    GradeId: selectedGradeId,
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
            sendData.append("GradeId", selectedGradeId);
            selectedSectionIds.forEach(section => {
                sendData.append("Section", section);
            });
            sendData.append("UserType", userType);
            sendData.append("RollNumber", rollNumber);
            sendData.append("Subject", selectedSubject);
            sendData.append("Heading", heading);
            sendData.append("Folder", selectedFolder);
            sendData.append("FileType", fileType || "");
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("Status", submitStatus);
            sendData.append("PostedOn", submitStatus === 'post' ? todayDateTime : "");
            sendData.append("DraftedOn", submitStatus === 'draft' ? todayDateTime : "");

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

            setPreviewData({
                uploadedFiles: [],
                heading: '',
            });
        } catch (error) {
            setMessage("Error while inserting data");
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
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                width: "100%",
                py: 1.5,
                borderBottom: "1px solid #ddd",
                px: 2,
                marginTop: "-2px"
            }}>
                <Link style={{ textDecoration: "none" }} to="/dashboardmenu/studymaterials">
                    <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                </Link>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Study Material</Typography>
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
                                <Typography sx={{ mb: 0.5 }}>Select Class <span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
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
                                                    backgroundColor: "#fff",
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
                                <Typography sx={{ mb: 0.5 }}>Select Section<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                <FormControl sx={{ width: "100%" }}>
                                    <Select
                                        multiple
                                        disabled={!selectedGrade}
                                        displayEmpty
                                        value={selectedSectionIds}
                                        onChange={handleSectionChange}
                                        input={<OutlinedInput />}
                                        renderValue={(selected) =>
                                            selected.length === 0 ? (
                                                <Typography sx={{ color: "#aaa", fontSize: "13px", fontWeight: "600" }}>
                                                    Select Section
                                                </Typography>
                                            ) : (
                                                selected.join(", ")
                                            )
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 250,
                                                    overflow: "auto",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
                                                    "& .MuiMenuItem-root": {
                                                        fontSize: "15px",
                                                    },
                                                },
                                            },
                                        }}
                                        sx={{
                                            height: "34px",
                                            fontSize: "15px",
                                            color: selectedSectionIds.length > 0 ? "#000" : "#aaa",
                                            backgroundColor: "#fff",
                                        }}
                                    >
                                        <MenuItem value="all">
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={
                                                    selectedSectionIds.length > 0 && !isAllSelected
                                                }
                                                sx={{
                                                    color: "#fff", padding: "0 5px", "&.Mui-checked": {
                                                        color: "#fff",
                                                    },
                                                }}
                                            />
                                            <Typography sx={{ fontSize: "14px", color: "#fff" }}>
                                                Select All
                                            </Typography>
                                        </MenuItem>

                                        {sections.map((section) => (
                                            <MenuItem key={section.sectionName} value={section.sectionName}>
                                                <Checkbox
                                                    checked={selectedSectionIds.includes(section.sectionName)}
                                                    sx={{
                                                        padding: "0 5px",
                                                        color: "#fff",
                                                        "&.Mui-checked": {
                                                            color: "#fff",
                                                        },
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: "14px", ml: 1, color: "#fff" }}>
                                                    {section.sectionName}
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={{ mb: 0.5, }}>Add Subject<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                {/* <Autocomplete
                                    disabled={!selectedGrade}
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
                                                    backgroundColor: "#fff",
                                                },
                                            }}
                                        />
                                    )}
                                /> */}
                                <TextField
                                    id="outlined-size-small"
                                    size="small"
                                    fullWidth
                                    required
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    sx={{
                                        width: "100%",
                                        backgroundColor: "#fff",
                                        "& .MuiOutlinedInput-root": {
                                            minHeight: "33px",
                                        },
                                        "& .MuiOutlinedInput-input": {
                                            padding: "4px 8px",
                                            fontSize: "13px",
                                        },
                                    }}
                                />

                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={{ mb: 0.5, }}>Select Folder<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                <Grid container sx={{ display: "flex", alignItems: "center" }}>
                                    <Grid size={{
                                        lg: userType === "superadmin" || userType === "admin" || userType === "staff" ? 10.5 : 12
                                    }}>
                                        <Autocomplete
                                            disabled={!selectedGradeId}
                                            disablePortal
                                            options={folders}
                                            getOptionLabel={(option) => option.folderName || ''}
                                            value={
                                                selectedFolder
                                                    ? folders.find((folder) => folder.folderName === selectedFolder) || null
                                                    : null
                                            }
                                            onChange={(event, newValue) => {
                                                setSelectedFolder(newValue ? newValue.folderName : null);
                                            }}
                                            isOptionEqualToValue={(option, value) =>
                                                option.folderName === value.folderName
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
                                                    {option.folderName}
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
                                                            backgroundColor: "#fff",
                                                        },
                                                    }}
                                                />
                                            )}
                                        />

                                    </Grid>
                                    {(userType === "superadmin" || userType === "admin" || userType === "staff") &&
                                        <Grid
                                            sx={{ display: "flex", justifyContent: "end" }}
                                            size={{
                                                lg: 1.5
                                            }}>
                                            <IconButton
                                                disabled={!selectedGrade}
                                                sx={{
                                                    border: selectedGrade ? "1px solid black" : "1px solid gray",
                                                    width: "27px",
                                                    height: "27px",
                                                }}
                                                onClick={handleCreateFolder}
                                            >
                                                <AddIcon
                                                    style={{ fontSize: "15px", color: selectedGrade ? "#000" : "gray" }}
                                                />
                                            </IconButton>

                                            <Dialog maxWidth="xs" fullWidth open={openFolderPopup} onClose={handleCreateFolderClose}>
                                                <DialogContent>
                                                    <Tabs textColor={websiteSettings.mainColor}
                                                        indicatorColor={websiteSettings.mainColor}
                                                        sx={{
                                                            "& .MuiTabs-indicator": { backgroundColor: websiteSettings.mainColor },
                                                            "& .MuiTab-root": { color: "#777" },
                                                            "& .Mui-selected": { color: "#000" },
                                                            px: 1
                                                        }}
                                                        value={value} onChange={handleChange} aria-label="basic tabs example">
                                                        <Tab sx={{ textTransform: "none", fontWeight: "600" }} label="Add Folder" />
                                                        <Tab sx={{ textTransform: "none", fontWeight: "600" }} label="Remove Folder" />
                                                    </Tabs>
                                                    {value === 0 && <Box px={1}>
                                                        <Typography sx={{ mb: 1, mt: 2 }}>Folder Name<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                                        <TextField
                                                            type="text"
                                                            size="small"
                                                            fullWidth
                                                            value={folderName}
                                                            onChange={(e) => setFolderName(e.target.value)}
                                                            inputProps={{ maxLength: 30 }}
                                                        />

                                                        <Box sx={{ display: "flex", justifyContent: "end", pt: 2, }}>

                                                            <Button
                                                                sx={{
                                                                    border: "1px solid black",
                                                                    color: "black",
                                                                    borderRadius: "30px",
                                                                    width: "70px",
                                                                    fontSize: '11px',
                                                                    py: 0.2,
                                                                    mr: 2
                                                                }}
                                                                onClick={handleCreateFolderClose}>
                                                                Cancel
                                                            </Button>

                                                            <Button
                                                                disabled={!folderName.trim()}
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
                                                                onClick={handleSubmitCreateFolder}>
                                                                Add
                                                            </Button>

                                                        </Box>
                                                    </Box>}
                                                    {value === 1 &&
                                                        <Box px={1}>
                                                            <Box sx={{ border: "1px solid #ccc", mt: 1, borderRadius: "5px", }}>
                                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <Typography sx={{ mb: 1, fontWeight: "600", px: 2, pt: 2 }}>Folder Names</Typography>
                                                                    <Box sx={{
                                                                        pr: 2.7,
                                                                        pt: 1
                                                                    }}>
                                                                        <Tooltip
                                                                            title={
                                                                                <Typography sx={{ fontSize: 12, maxWidth: 200 }}>
                                                                                    Removing these folders will also delete all items contained within them.
                                                                                </Typography>
                                                                            }
                                                                            placement="left"
                                                                            arrow
                                                                        >
                                                                            <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                                                                                <InfoOutlinedIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                </Box>

                                                                {/* {subjectOptions.length === 0 ? (
                                                                    <Typography sx={{ color: "gray", fontStyle: "italic" }}>
                                                                        No folders available
                                                                    </Typography>
                                                                ) : ( */}
                                                                {!folders || folders.length === 0 ? (
                                                                    <Typography
                                                                        sx={{
                                                                            color: "gray",
                                                                            fontStyle: "italic",
                                                                            textAlign: "center",
                                                                            py: 2,
                                                                        }}
                                                                    >
                                                                        No folders available
                                                                    </Typography>
                                                                ) : (
                                                                    <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
                                                                        {folders.map((folder) => (
                                                                            <Stack
                                                                                key={folder.id}
                                                                                direction="row"
                                                                                alignItems="center"
                                                                                justifyContent="space-between"
                                                                                sx={{
                                                                                    borderBottom: "1px solid #eee",
                                                                                    py: 1,
                                                                                    p: 2
                                                                                }}
                                                                            >
                                                                                <Typography sx={{ fontSize: "14px" }}>{folder.folderName}</Typography>
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => onRemove(folder.folderName)}
                                                                                    sx={{
                                                                                        color: "#777",
                                                                                        "&:hover": { color: "red" },
                                                                                    }}
                                                                                >
                                                                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Stack>
                                                                        ))}
                                                                    </Box>
                                                                    )}
                                                                {/* )} */}
                                                                <Dialog open={openFolderPopup1} onClose={() => handleRemoveFolderClose(false)}>
                                                                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                                                                        <Box sx={{
                                                                            textAlign: 'center',
                                                                            backgroundColor: '#fff',
                                                                            p: 3,
                                                                            width: "70%",
                                                                        }}>
                                                                            {userType === "superadmin" ? (
                                                                                <Typography sx={{ fontSize: "20px" }}>
                                                                                    Are you sure you want to delete this folder? Deleting this folder will also permanently remove all files contained within it. </Typography>
                                                                            ) : (
                                                                                <Typography sx={{ fontSize: "20px" }}>
                                                                                    Removing this folder will also delete all items contained within it. <br />
                                                                                    Are you sure you want to continue?
                                                                                </Typography>
                                                                            )}
                                                                            <DialogActions sx={{
                                                                                justifyContent: 'center',
                                                                                backgroundColor: '#fff',
                                                                                pt: 2
                                                                            }}>
                                                                                <Button
                                                                                    onClick={() => handleRemoveFolderClose(false)}
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
                                                                                    onClick={() => handleRemoveFolderClose(true)}
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        backgroundColor: websiteSettings.mainColor,
                                                                                        width: "110px",
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '16px',
                                                                                        py: 0.2,
                                                                                        color: websiteSettings.textColor,
                                                                                    }}
                                                                                >
                                                                                    Yes, Delete
                                                                                </Button>
                                                                            </DialogActions>
                                                                        </Box>

                                                                    </Box>
                                                                </Dialog>
                                                            </Box>
                                                            <Box sx={{ display: "flex", justifyContent: "end", pt: 2, }}>

                                                                <Button
                                                                    sx={{
                                                                        border: "1px solid black",
                                                                        color: "black",
                                                                        borderRadius: "30px",
                                                                        width: "70px",
                                                                        fontSize: '11px',
                                                                        py: 0.2,
                                                                    }}
                                                                    onClick={handleCreateFolderClose}>
                                                                    Cancel
                                                                </Button>

                                                            </Box>
                                                        </Box>}
                                                </DialogContent>


                                            </Dialog>
                                        </Grid>
                                    }
                                    {/* <Grid item lg={1.5} sx={{ display: "flex", justifyContent: "end" }}>
                                        <IconButton
                                            disabled={!selectedGrade}
                                            sx={{
                                                border: selectedGrade ? "1px solid black" : "1px solid gray",
                                                width: "27px",
                                                height: "27px",
                                            }}
                                            onClick={handleDeleteFolder}
                                        >
                                            <DeleteOutlineOutlinedIcon
                                                style={{ fontSize: "15px", color: selectedGrade ? "#000" : "gray" }}
                                            />
                                        </IconButton>
                                    </Grid> */}
                                </Grid>
                            </Grid>

                            <Grid
                                sx={{ width: "100%" }}
                                size={{
                                    lg: 12
                                }}>
                                <Typography>Add Heading <span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                <TextField
                                    id="outlined-size-small"
                                    size="small"
                                    fullWidth
                                    sx={{ width: "100%", backgroundColor: "#fff", }}
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

                        </Grid>


                        <Box sx={{ mt: 3, }}>
                            <Grid container spacing={2} sx={{ pt: 8, px: 2 }}>
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
                                        onClick={() => handleSubmit('post')}>
                                        Publish
                                    </Button>
                                </Grid>

                            </Grid>
                        </Box>

                    </Box>
                </Grid >

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
            </Grid >
        </Box >
    );
}
