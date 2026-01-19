import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, FormControl, Select, OutlinedInput, MenuItem, Checkbox, Popper, ClickAwayListener, AccordionSummary, Accordion, AccordionDetails, FormControlLabel } from "@mui/material";
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
import { GettingGrades, GetUsersBaseDetails, postCircular, postNews } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import CancelIcon from "@mui/icons-material/Cancel";
import SimpleTextEditor from "../../EditTextEditor";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddAdmissionNumbersDialog from "../../AddAdmissionNumberDialog";

export default function CreateNewsPage() {
    const navigate = useNavigate()
    const ref = useRef();
    const staffDropdownRef = useRef(null);
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [formattedDTValue, setFormattedDTValue] = useState(null);
    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pastedLink, setPastedLink] = useState("");
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
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
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [changesHappended, setChangesHappended] = useState(false);
    const [expandedGrade, setExpandedGrade] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEveryone, setIsEveryone] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [specificNo, setSpecificNo] = useState("");
    const [openTextarea, setOpenTextarea] = useState(false);
    const [staffAnchorEl, setStaffAnchorEl] = useState(null);
    const [selectedStaffs, setSelectedStaffs] = useState([]);
    const [staffDropdownAnchorEl, setStaffDropdownAnchorEl] = useState(null);
    const [selectedStaffOptions, setSelectedStaffOptions] = useState([]);
    const [users, setUsers] = useState([]);
    const staffOptions = ['Teaching', 'Non-Teaching', 'Supporting'];
    const allSelected = staffOptions.every(option => selectedStaffOptions.includes(option));
    const isIndeterminate = selectedStaffOptions.length > 0 && !allSelected;

    const [previewData, setPreviewData] = useState({
        heading: '',
        content: '',
        uploadedFiles: [],
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
        setIsPreview(true)
        setPreviewData({
            heading,
            content: newsContentHTML,
            uploadedFiles,
            pastedLink,
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

    const handleImageClose = () => {
        setUploadedFiles([]);
        setFileType('')
    };

    const handleEveryoneChange = (event) => {
        setIsEveryone(event.target.checked);
        setSelectedStaffOptions([])
        setSelectedIds([])
        setSpecificNo('')
    };

    const toggleStaffDropdown = () => {
        setStaffDropdownAnchorEl(staffDropdownAnchorEl ? null : staffDropdownRef.current);
    };

    const handleStaffClickAway = () => {
        setStaffDropdownAnchorEl(null);
    };

    const handleStaffOptionToggle = (option) => {
        setSelectedStaffOptions((prev) =>
            prev.includes(option)
                ? prev.filter((item) => item !== option)
                : [...prev, option]
        );
    };

    const renderStaffValue = () => {
        return selectedStaffOptions.length === 0 ? 'Select Staff' : selectedStaffOptions.join(', ');
    };

    const handleOpenTextArea = (value) => {
        setOpenTextarea(value)
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

    const toggleDropdown = (event) => {
        setAnchorEl(anchorEl ? null : ref.current);
    };

    const handleClickAway = () => {
        setAnchorEl(null);
    };

    const isGradeSelected = (grade) => {
        return grade.sections.every(section => selectedIds.includes(`${grade.id}-${section}`));
    };

    const handleGradeToggle = (grade) => {
        const allSectionIds = grade.sections.map(section => `${grade.id}-${section}`);
        const isSelected = isGradeSelected(grade);
        const updated = isSelected
            ? selectedIds.filter(id => !allSectionIds.includes(id))
            : [...selectedIds, ...allSectionIds];
        setSelectedIds(updated);
    };

    const handleSectionToggle = (gradeId, section) => {
        const sectionId = `${gradeId}-${section}`;
        setSelectedIds(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleSelectAll = () => {
        const allSectionIds = grades.flatMap(grade =>
            grade.sections.map(section => `${grade.id}-${section}`)
        );
        const allSelected = selectedIds.length === allSectionIds.length;
        setSelectedIds(allSelected ? [] : allSectionIds);
    };

    const isEveryoneChecked = () => {
        const allIds = grades.flatMap(grade =>
            grade.sections.map(section => `${grade.id}-${section}`)
        );
        return selectedIds.length === allIds.length;
    };

    const isEveryoneIndeterminate = () => {
        const allIds = grades.flatMap(grade =>
            grade.sections.map(section => `${grade.id}-${section}`)
        );
        return selectedIds.length > 0 && selectedIds.length < allIds.length;
    };

    const renderValue = () => {
        const selectedData = grades
            .map((grade) => {
                const selectedSections = grade.sections.filter((section) =>
                    selectedIds.includes(`${grade.id}-${section}`)
                );
                if (selectedSections.length > 0) {
                    return `${grade.sign} (${selectedSections.join(", ")})`;
                }
                return null;
            })
            .filter(Boolean);

        return selectedData.length > 0 ? selectedData.join(", ") : "Select Class & Section";
    };

    const handleShow = (event) => {
        setIsPreview(false)
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

    useEffect(() => {
        if (!uploadedFiles && !pastedLink.trim()) {
            setFileType("");
        }
    }, [uploadedFiles, pastedLink]);

    useEffect(() => {
        getUsers()
    }, []);

    const getUsers = async () => {
        try {
            const res = await axios.get(GetUsersBaseDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(res.data.users)
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const specificUsersArray = specificNo
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== "");

    const staffUserTypesFormatted = selectedStaffOptions.map(item =>
        item.toLowerCase().replace(/-/g, '')
    );

    const handleInsertNewsData = async (status) => {
        setIsSubmitted(true);

        if (
            !isEveryone &&
            selectedIds.length === 0 &&
            selectedStaffOptions.length === 0 &&
            !specificNo.trim()
        ) {
            setMessage("Please select at least one recipient");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!heading.trim()) {
            setMessage("Headline is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (status === "post" || status === "schedule") {
            if (!newsContentHTML.trim()) {
                setMessage("Description is required");
                setOpen(true);
                setColor(false);
                setStatus(false);
                return;
            }
        }

        setIsLoading(true);

        try {
            const sendData = new FormData();
            sendData.append("HeadLine", heading);
            sendData.append("Circular", newsContentHTML);
            sendData.append("UserType", userType);
            sendData.append("RollNumber", rollNumber);
            sendData.append("PostedOn", todayDateTime);
            sendData.append("Status", status);
            sendData.append("ScheduleOn", formattedDTValue || "");
            sendData.append("DraftedOn", status === 'draft' ? todayDateTime : "");
            sendData.append("FileType", fileType || "empty");
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("everyone", isEveryone ? "Y" : "");

            const { gradeSections } = getGradeSectionsPayload();
            gradeSections.forEach((item, index) => {
                sendData.append(`CircularGradeSections[${index}].GradeId`, item.gradeId);
                item.sections.forEach((section, sIndex) => {
                    sendData.append(`CircularGradeSections[${index}].Sections[${sIndex}]`, section);
                });
            });

            if (gradeSections.length > 0) {
                sendData.append("students", "Y");
            } else {
                sendData.append("students", "");
            }

            if (selectedStaffOptions.length > 0) {
                sendData.append("staffs", "Y");
                staffUserTypesFormatted.forEach((type, index) => {
                    sendData.append(`StaffUserTypes[${index}]`, type);
                });
            } else {
                sendData.append("staffs", "");
            }

            if (specificUsersArray.length > 0) {
                sendData.append("specific", "Y");

                specificUsersArray.forEach((user, index) => {
                    sendData.append(`SpecificUsers[${index}]`, user);
                });
            } else {
                sendData.append("specific", "");
            }


            const res = await axios.post(postCircular, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOpen(true);
            setColor(true);
            setStatus(true);
            if (userType === "superadmin") {
                if (status === "post") {
                    setMessage("Circulars created successfully");
                } else if (status === "schedule") {
                    setMessage("Circulars scheduled successfully");
                } else {
                    setMessage("Draft saved successfully");
                }
            }

            if (userType !== "superadmin") {
                if (status === "draft") {
                    setMessage("Draft saved successfully");
                } else {
                    setMessage("Requested successfully");
                }
            }

            setHeading("");
            setIsEveryone(false);
            setSelectedIds([]);
            setSelectedStaffOptions([]);
            setSpecificNo("");
            setExpandedGrade(null);
            setNewsContentHTML("");
            setDTValue(null)
            setFileType("empty")
            setUploadedFiles([]);
            setPreviewData({
                heading: '',
                content: '',
                uploadedFiles: [],
            });
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
            {isLoading && <Loader />}
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                borderBottom: "1px solid #ddd",
                display: "flex",
                px: 2,
                alignItems: "center",
                width: "100%",
                py: 1.5,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Circulars</Typography>
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
                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <FormControlLabel
                                    sx={{
                                        alignItems: 'center',
                                        m: 0,
                                    }}
                                    control={
                                        <Checkbox
                                            checked={isEveryone}
                                            onChange={handleEveryoneChange}
                                            color="primary"
                                            sx={{ p: 0.5, mr: 1 }}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                                            Everyone
                                        </Typography>
                                    }
                                />

                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        ref={ref}
                                        onClick={toggleDropdown}
                                        disabled={isEveryone}
                                        sx={{
                                            width: "100%",
                                            justifyContent: "flex-start",
                                            textTransform: "none",
                                            overflow: "hidden",
                                            color: "#000",
                                            border: "1px solid #ccc",
                                            height: "40px",
                                            textAlign: "left",
                                            backgroundColor: "#fff",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                width: "100%",
                                            }}
                                        >
                                            {renderValue()}
                                        </Box>
                                    </Button>

                                    <Popper
                                        open={Boolean(anchorEl)}
                                        anchorEl={ref.current}
                                        placement="bottom-start"
                                        style={{ zIndex: 1300, width: ref.current?.offsetWidth }}
                                    >
                                        <ClickAwayListener onClickAway={handleClickAway}>
                                            <Paper sx={{ maxHeight: 400, overflowY: "auto", bgcolor: "#000", color: "#fff", p: 1 }}>

                                                <MenuItem
                                                    onClick={handleSelectAll}
                                                    sx={{ padding: "0px", mb: 1 }}
                                                >
                                                    <Box sx={{
                                                        border: "1px solid #fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        backgroundColor: "#111",
                                                        borderRadius: "3px",
                                                        boxShadow: "none",
                                                        border: "1px solid #333",
                                                        width: "100%"
                                                    }}>
                                                        <Checkbox
                                                            checked={isEveryoneChecked()}
                                                            indeterminate={isEveryoneIndeterminate()}
                                                            sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" } }}
                                                        />
                                                        <Typography sx={{ fontSize: "14px" }}>Everyone</Typography>
                                                    </Box>
                                                </MenuItem>
                                                {grades.map((grade) => (
                                                    <Box key={grade.id} sx={{ mb: 1 }}>
                                                        <Accordion
                                                            expanded={expandedGrade === grade.id}
                                                            onChange={() => { }}
                                                            sx={{
                                                                backgroundColor: "#111",
                                                                boxShadow: "none",
                                                                border: "1px solid #333",
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                sx={{ px: 1, pointerEvents: "none", }}
                                                                expandIcon={
                                                                    <ExpandMoreIcon
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpandedGrade(
                                                                                expandedGrade === grade.id ? null : grade.id
                                                                            );
                                                                        }}
                                                                        sx={{ color: "#fff", pointerEvents: "auto" }}
                                                                    />
                                                                }
                                                            >
                                                                <Box
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleGradeToggle(grade);
                                                                    }}
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        cursor: "pointer",
                                                                        pointerEvents: "auto",
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={isGradeSelected(grade)}
                                                                        indeterminate={
                                                                            grade.sections.some((section) =>
                                                                                selectedIds.includes(`${grade.id}-${section}`)
                                                                            ) && !isGradeSelected(grade)
                                                                        }
                                                                        sx={{ color: "#fff", padding: "0px 10px 0px 0px", "&.Mui-checked": { color: "#fff" } }}
                                                                    />
                                                                    <Typography sx={{ fontSize: "14px", color: "white" }}>
                                                                        {grade.sign}
                                                                    </Typography>
                                                                </Box>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {grade.sections.map((section) => (
                                                                    <MenuItem
                                                                        key={section}
                                                                        sx={{
                                                                            padding: "0px 10px 0px 30px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            color: "#fff",
                                                                        }}
                                                                        onClick={() => handleSectionToggle(grade.id, section)}
                                                                    >
                                                                        <Checkbox
                                                                            checked={selectedIds.includes(`${grade.id}-${section}`)}
                                                                            sx={{ color: "#fff", padding: "0px 10px 0px 0px", "&.Mui-checked": { color: "#fff" } }}
                                                                        />
                                                                        <Typography>{section}</Typography>
                                                                    </MenuItem>
                                                                ))}
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        </ClickAwayListener>
                                    </Popper>
                                </Box>
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Button
                                    disabled={isEveryone}
                                    ref={staffDropdownRef}
                                    onClick={toggleStaffDropdown}
                                    sx={{
                                        width: "100%",
                                        justifyContent: "flex-start",
                                        textTransform: "none",
                                        overflow: "hidden",
                                        color: "#000",
                                        border: "1px solid #ccc",
                                        height: "40px",
                                        textAlign: "left",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    {renderStaffValue()}
                                </Button>

                                <Popper
                                    open={Boolean(staffDropdownAnchorEl)}
                                    anchorEl={staffDropdownAnchorEl}
                                    style={{ zIndex: 1300, width: ref.current?.offsetWidth }}
                                >
                                    <ClickAwayListener onClickAway={handleStaffClickAway}>
                                        <Paper sx={{ bgcolor: "#000", color: "#fff", p: 1 }}>
                                            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                                                <MenuItem sx={{ py: 0 }} onClick={() => {
                                                    if (allSelected) {
                                                        setSelectedStaffOptions([]);
                                                    } else {
                                                        setSelectedStaffOptions(staffOptions);
                                                    }
                                                }}>
                                                    <Checkbox
                                                        style={{ color: "#fff" }}
                                                        checked={allSelected}
                                                        indeterminate={isIndeterminate}
                                                    />
                                                    Select All
                                                </MenuItem>

                                                {staffOptions.map((option) => (
                                                    <MenuItem sx={{ py: 0 }} key={option} onClick={() => handleStaffOptionToggle(option)}>
                                                        <Checkbox
                                                            style={{ color: "#fff" }}
                                                            checked={selectedStaffOptions.includes(option)}
                                                        />
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </ClickAwayListener>
                                </Popper>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                {/* <Typography sx={{ mb: 0.5, ml: 1 }}>Add Admission Number</Typography> */}
                                <Box>
                                    <TextField
                                        disabled={isEveryone}
                                        value={specificNo}
                                        placeholder="Specific Members"
                                        size="small"
                                        sx={{
                                            width: "100%",
                                            backgroundColor: "#fff",

                                            '& .MuiInputBase-root': {
                                                cursor: 'pointer',
                                            },
                                            '& .MuiInputBase-input': {
                                                cursor: 'pointer',
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: 'black',
                                                opacity: 1,
                                                fontSize: "14px"
                                            },
                                        }}
                                        onClick={() => handleOpenTextArea(1)}
                                    />
                                </Box>
                                <AddAdmissionNumbersDialog
                                    open={openTextarea}
                                    onClose={() => setOpenTextarea(false)}
                                    users={users}
                                    value={specificNo}
                                    onSave={setSpecificNo}
                                />

                            </Grid>
                            {isPreview &&
                                <Box onClick={handleShow} sx={{ fontSize: "13px", ml: 2, mt: 0.5, cursor: "pointer", color: "#777", textDecoration: "underline" }}>Show selected items ᐅ</Box>
                            }
                        </Grid>

                        <Typography sx={{ mt: 2 }}>Add Heading <span style={{ color: "#777", fontSize: "13px", }}> (Required)</span></Typography>

                        <TextField
                            sx={{ backgroundColor: "#fff", }}
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            required
                            value={heading}
                            onChange={handleHeadingChange}
                        />

                        <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                            {`${heading.length}/100`}
                        </Typography>

                        <Typography sx={{ pt: 3 }}>Add Description<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>

                        <SimpleTextEditor
                            value={newsContentHTML}
                            onContentChange={handleRichTextChange}
                        />


                        <Box
                            sx={{
                                width: "100%",
                                backgroundColor: "#fdfdfd",
                            }}
                        >
                            <Typography sx={{ pt: 2 }}>Select Image</Typography>

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
                        </Box>

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

                        <Box sx={{ mt: 3 }}>
                            <Grid container>
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 4.4
                                    }}>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            textTransform: 'none',
                                            width: "120px",
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            py: 0.2,
                                            border: '1px solid black',
                                            color: 'black',
                                            fontWeight: "600",
                                            backgroundColor: "#fff"
                                        }}
                                        onClick={() => handleInsertNewsData('draft')}>
                                        Save as Draft
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
                                            backgroundColor: "#fff"
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
                                                    onClick={() => handleInsertNewsData('post')}>
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
                                                    onClick={() => handleInsertNewsData('schedule')}>
                                                    Schedule
                                                </Button>
                                            </Grid>
                                        )}
                                    </>}

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
                                                onClick={() => handleInsertNewsData(DTValue ? 'schedule' : 'post')}>
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
                        {!isPreview &&
                            (isEveryone ? (
                                <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                                    For Everyone
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        backgroundColor: "#f9f9f9",
                                        borderRadius: "8px",
                                        p: 2,
                                        border: "1px solid #ddd",
                                        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    {/* Selected Students */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                                            Selected Class & Section
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "13px",
                                                color: "#555",
                                                mt: 0.5,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {renderValue() || "None"}
                                        </Typography>
                                    </Box>

                                    {/* Selected Staffs */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                                            Selected Staff
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "13px",
                                                color: "#555",
                                                mt: 0.5,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {selectedStaffOptions && selectedStaffOptions.length > 0
                                                ? selectedStaffOptions.join(', ')
                                                : "None"}
                                        </Typography>

                                    </Box>

                                    {/* Specific */}
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                                            Specific Members
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "13px",
                                                color: "#555",
                                                mt: 0.5,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {specificNo || "None"}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        {isPreview &&
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
                        }
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
