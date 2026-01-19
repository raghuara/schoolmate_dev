import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Popper, ClickAwayListener, Accordion, AccordionSummary, AccordionDetails, FormControlLabel } from "@mui/material";
import axios from "axios";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { FindMessage, GettingGrades, GetUsersBaseDetails, postNews, updateMessage } from "../../../../Api/Api";
import SnackBar from "../../../SnackBar";
import SimpleTextEditor from "../../../EditTextEditor";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddAdmissionNumbersDialog from "../../../AddAdmissionNumberDialog";

export default function MessagesDraftEditPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [isLoading, setIsLoading] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState("Everyone");
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [changesHappended, setChangesHappended] = useState(false);
    const [gradeIds, setGradeIds] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const location = useLocation();
    const { id } = location.state || {};
    const [formattedDTValue, setFormattedDTValue] = useState(null);
    const [newsStatus, setNewsStatus] = useState("");
    const [dateTimeValue, setDateTimeValue] = useState("");
    const ref = useRef();
    const [anchorEl, setAnchorEl] = useState(null);
    const [expandedGrade, setExpandedGrade] = useState(null);
    const [isEveryone, setIsEveryone] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [specificNo, setSpecificNo] = useState("");
    const [staffDropdownAnchorEl, setStaffDropdownAnchorEl] = useState(null);
    const [selectedStaffOptions, setSelectedStaffOptions] = useState([]);
    const staffDropdownRef = useRef(null);
    const staffOptions = ['Teaching', 'Non-Teaching', 'Supporting'];
    const allSelected = staffOptions.every(option => selectedStaffOptions.includes(option));
    const isIndeterminate = selectedStaffOptions.length > 0 && !allSelected;
    const [openTextarea, setOpenTextarea] = useState(false);
    const [users, setUsers] = useState([]);
    const [isStudents, setIsStudents] = useState("");
    const [isStaffs, setIsStaffs] = useState("");
    const [isSpecific, setIsSpecific] = useState("");
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [previewData, setPreviewData] = useState({
        heading: '',
        content: '',
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

    const handleOpenTextArea = (value) => {
        setOpenTextarea(value)
    };
    const handleEveryoneChange = (event) => {
        setIsEveryone(event.target.checked);
        setSelectedStaffOptions([])
        setSelectedIds([])
        setSpecificNo('')
    };

    const toggleDropdown = (event) => {
        setAnchorEl(anchorEl ? null : ref.current);
    };

    const handleShow = (event) => {
        setIsPreview(false)
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
        return selectedStaffOptions.length === 0 ? 'Select Staffs' : selectedStaffOptions.join(', ');
    };
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
        });
    };

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/draft/messages')
        }
    };

    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/draft/messages')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/draft/messages')
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

    const handleClickAway = () => {
        setAnchorEl(null);
    };

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
    
    useEffect(() => {
        if (id) {
            handleInsertNewsData(id)
        }
    }, []);

    const handleInsertNewsData = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindMessage, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setHeading(res.data.headLine)
            setNewsContentHTML(res.data.message)
            setNewsStatus(res.data.status)
            setIsEveryone(res.data.everyone === 'Y');
            const staffUserTypesFromApi = res.data.staffUserTypes || [];
            const formattedStaffOptions = staffUserTypesFromApi.map(type => {
                if (type === 'nonteaching') return 'Non-Teaching';
                if (type === 'teaching') return 'Teaching';
                if (type === 'supporting') return 'Supporting';
                return type;
            });
            if (res.data.students === 'Y') {
                setIsEveryone(res.data.everyone)
            }

            if (res.data.students === 'Y') {
                setIsStudents('Y');
            }

            if (res.data.students === 'Y') {
                setIsStaffs(res.data.staffs)
            }

            if (res.data.students === 'Y') {
                setIsSpecific(res.data.specific)
            }



            setSelectedStaffOptions(formattedStaffOptions);
            setSpecificNo(res.data.specificUsers.join(', '));

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
    console.log(gradeSections, "ff");

    const specificUsersArray = specificNo
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== "");

    const staffUserTypesFormatted = selectedStaffOptions.map(item =>
        item.toLowerCase().replace(/-/g, '')
    );

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
            const sendData = {
                id: id,
                headLine: heading,
                message: newsContentHTML,
                userType: userType,
                rollNumber: rollNumber,
                gradeAssignments: gradeSections.gradeSections,
                scheduleOn: formattedDTValue || dateTimeValue || "",
                updatedOn: todayDateTime,
                postedOn: status === "post" ? todayDateTime : "",
                everyone: isEveryone ? "Y" : "",
                ...(gradeSections.gradeSections && gradeSections.gradeSections.length > 0 && { students: "Y" }),

                ...(selectedStaffOptions.length > 0
                    ? {
                        staffs: "Y",
                        staffUserTypes: staffUserTypesFormatted,
                    }
                    : {
                        staffs: "",
                    }),

                ...(specificUsersArray.length > 0
                    ? {
                        specific: "Y",
                        specificUsers: specificUsersArray,
                    }
                    : {
                        specific: "",
                    }),
            };

            const res = await axios.put(updateMessage, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            if (userType === "superadmin") {
                if (status === "post") {
                    setMessage("Message updated successfully");
                } else if (status === "schedule") {
                    setMessage("Message scheduled successfully");
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

            setTimeout(() => {
                navigate("/dashboardmenu/draft/messages");
            }, 500);

        } catch (error) {
            console.error("Error while inserting news data:", error);

            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message || error.response.data;
                if (errorMessage.includes("ScheduleOn must be a future date and time")) {
                    setMessage("Please provide the future date");
                    setOpen(true);
                    setColor(false);
                    setStatus(false);
                }
            }
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                width: "100%",
                py: 1.5,
                px: 2,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Message</Typography>
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
                                        <Paper sx={{ maxHeight: 400, overflowY: "auto", bgcolor: "#000", color: "#fff", p: 1 }}>

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
                                        placeholder="Specific"
                                        size="small"
                                        sx={{
                                            width: "100%",
                                            backgroundColor: "#fff",
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

                                {/* <Dialog
                                    open={openTextarea === 1}
                                    onClose={() => setOpenTextarea(null)}
                                    maxWidth="sm"
                                    fullWidth
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            minHeight: '200px',
                                            padding: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: '#fff',
                                                pr: 3,
                                                width: '100%',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    fontWeight: 'bold',
                                                    marginBottom: 1,
                                                    pb: 1,
                                                    borderBottom: "1px solid #AFAFAF",
                                                }}
                                            >
                                                Add Admission Number
                                            </Typography>
                                            <TextareaAutosize
                                                minRows={6}
                                                placeholder="Type here..."
                                                value={specificNo}
                                                onChange={(e) =>
                                                    setSpecificNo(e.target.value)
                                                }
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ccc',
                                                    fontSize: '14px',
                                                    marginBottom: '20px',
                                                    resize: 'none',
                                                    border: "none",
                                                    outline: 'none',
                                                }}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Button
                                                    onClick={() => setOpenTextarea(null)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        backgroundColor: websiteSettings.mainColor,
                                                        color: websiteSettings.textColor,
                                                        borderRadius: '30px',
                                                        fontSize: '16px',
                                                        padding: '0px 35px',
                                                        '&:hover': {
                                                            backgroundColor: websiteSettings.mainColor || '#0056b3',
                                                        },
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Dialog> */}
                            </Grid>
                            {isPreview &&
                                <Box onClick={handleShow} sx={{ fontSize: "13px", ml: 2, mt: 0.5, cursor: "pointer", color: "#777", textDecoration: "underline" }}>Show selected items ᐅ</Box>
                            }
                        </Grid>

                        <Typography sx={{ mt: 2 }}>Add Heading</Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff", }}
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
                        <Box mt={2}>
                            <Typography>Schedule</Typography>
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
                                            color: 'black',
                                            fontWeight: "600",
                                        }}
                                        onClick={handlePreview}>
                                        Preview
                                    </Button>
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

                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
