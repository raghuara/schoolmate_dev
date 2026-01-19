import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Accordion, AccordionSummary, AccordionDetails, Popper, ClickAwayListener, TextareaAutosize } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { GettingGrades, postMessage, postNews, postNotification } from "../../Api/Api";
import SnackBar from "../SnackBar";
import SimpleTextEditor from "../EditTextEditor";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import Loader from "../Loader";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function NotificationPage() {
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
    const [classData, setClassData] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedGrade, setExpandedGrade] = useState(null);
    const ref = useRef();
    const [gradeIds, setGradeIds] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [changesHappended, setChangesHappended] = useState(false);
    const [description, setDescription] = useState("");
    const [formattedDTValue, setFormattedDTValue] = useState(null);
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

    const [previewData, setPreviewData] = useState({
        heading: '',
        content: '',
    });

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

    const handleRecipientChange = (event, value) => {
        setChangesHappended(true)
        setSelectedRecipient(value || "Everyone");
    };

    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const handleQuestionChange = (event) => {
        setChangesHappended(true)
        setDescription(event.target.value);
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

    const handlePreview = () => {
        setPreviewData({
            heading,
            content: description,
        });
    };


    const handleCancelClick = () => {
        setHeading("");
        setDescription("");
        setSelectedRecipient("Everyone")
        setSelectedIds([])
        setFormattedDTValue(null)
        setDTValue(null);
    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/messages')
            console.log('Cancel confirmed');
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

    const handleInsertMessageData = async (status) => {
        setIsSubmitted(true);

        if (selectedRecipient === "Students" && selectedIds.length === 0) {
            setMessage("Please select the class");
            setOpen(true);
            setStatus(false);
            setColor(false);
            return;
        }

        if (!heading.trim()) {
            setMessage("Headline is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (!description.trim()) {
            setMessage("Description is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        setIsLoading(true);

        try {
            const sendData = {
                headLine: heading,
                description: description,
                userType: userType,
                rollNumber: rollNumber,
                recipient: selectedRecipient,
                status: status,
                notificationGradeSections: gradeSections.gradeSections,
                postedOn: status === "post" ? todayDateTime : "",
                scheduleOn: status === "schedule" ? formattedDTValue : "",
            };

            const res = await axios.post(postNotification, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (status === "post") {
                setMessage("Notification sent successfully");
            } else {
                setMessage("Notification scheduled successfully");
            }
            setOpen(true);
            setColor(true);
            setStatus(true);

            setHeading("");
            setDescription("");
            setSelectedRecipient("Everyone")
            setSelectedIds([])
            setFormattedDTValue(null)
            setDTValue(null);

        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/messages" replace />;
    }

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
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
                marginTop: "-2px"
            }}>

                <Typography sx={{ fontWeight: "600", fontSize: "20px", px: 2 }}>Create Notification</Typography>
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
                                <Typography sx={{ mb: 0.5 }}>Select Recipient</Typography>
                                <Autocomplete
                                    disablePortal
                                    options={["Everyone", 'Students', 'Teachers']}
                                    value={selectedRecipient}
                                    onChange={handleRecipientChange}
                                    sx={{
                                        width: "100%",
                                        '& .MuiAutocomplete-inputRoot': {
                                            height: '40px',
                                        },
                                    }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '100%',
                                                fontSize: "6px",
                                                backgroundColor: '#000',
                                                color: '#fff',
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li
                                            {...props}
                                            style={{
                                                ...props.style,
                                                fontSize: "15px",
                                            }}
                                            className="classdropdownOptions"
                                        >
                                            {option}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}

                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: params.InputProps.endAdornment,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: '33px',
                                                    fontSize: "15px",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            {selectedRecipient === "Students" &&
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 6,
                                        lg: 6
                                    }}>
                                    <Typography sx={{ mb: 0.5, ml: 1 }}>Select Class</Typography>
                                    <Box>
                                        <Button
                                            variant="outlined"
                                            ref={ref}
                                            onClick={toggleDropdown}
                                            sx={{
                                                width: "100%",
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                overflow: "hidden",
                                                color: "#000",
                                                border: "1px solid #ccc",
                                                height: "40px",
                                                textAlign: "left"
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
                            }
                        </Grid>

                        <Typography sx={{ mt: 2 }}>Add Heading</Typography>
                        <TextField
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            value={heading}
                            onChange={handleHeadingChange}
                        />

                        <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                            {`${heading.length}/100`}
                        </Typography>


                        <Typography sx={{ pt: 1 }}>Add Description</Typography>
                        <TextareaAutosize
                            value={description}
                            onChange={handleQuestionChange}
                            style={{
                                width: "100%",
                                height: "100px",
                                fontSize: "16px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                backgroundColor: "transparent",
                                resize: "none",
                                overflowY: "auto",
                                fontFamily: "sans-serif",
                                padding: "10px",
                                boxSizing: "border-box",
                            }}
                        />
                        <Box mt={2}>
                            <Typography>Schedule Notification</Typography>
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
                        <Box sx={{ mt: 14 }}>
                            <Grid container>
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 5.1
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
                                        Clear
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
                                {!DTValue && (
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
                                                backgroundColor: websiteSettings.mainColor,
                                                width: "80px",
                                                borderRadius: '30px',
                                                fontSize: '12px',
                                                py: 0.2,
                                                color: websiteSettings.textColor,
                                                fontWeight: "600",
                                            }}
                                            onClick={() => handleInsertMessageData('post')}>
                                            Notify
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
                                            lg: 2.3
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
                                            onClick={() => handleInsertMessageData('schedule')}>
                                            Schedule
                                        </Button>
                                    </Grid>
                                )}
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
