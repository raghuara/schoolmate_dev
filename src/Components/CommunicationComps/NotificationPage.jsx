import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Accordion, AccordionSummary, AccordionDetails, Popper, ClickAwayListener, TextareaAutosize, Chip, Divider } from "@mui/material";
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
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ScheduleSendOutlinedIcon from '@mui/icons-material/ScheduleSendOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

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
        const next = value || "Everyone";
        setSelectedRecipient(next);
        // Class picks only apply to Students - drop them so they can't be sent
        // along with an Everyone/Teachers notification.
        if (next !== "Students") {
            setSelectedIds([]);
            setAnchorEl(null);
        }
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
            setFormattedDTValue(null);
        }
    };

    // ── Derived state driving the preview, the reach banner and submit gating ──
    const isScheduled = Boolean(DTValue && formattedDTValue);
    const hasPreview = Boolean(heading.trim() || description.trim());

    const selectedSectionCount = selectedIds.length;

    const audienceSummary =
        selectedRecipient === "Students"
            ? (selectedSectionCount === 0
                ? "No classes selected yet"
                : `Students in ${selectedSectionCount} class${selectedSectionCount === 1 ? "" : "es"}`)
            : selectedRecipient === "Teachers"
                ? "All teachers"
                : "Everyone in the school";

    const audienceReady = selectedRecipient !== "Students" || selectedSectionCount > 0;

    const canSubmit =
        audienceReady &&
        heading.trim().length > 0 &&
        description.trim().length > 0 &&
        !isLoading;

    const resetForm = () => {
        setHeading("");
        setDescription("");
        setSelectedRecipient("Everyone")
        setSelectedIds([])
        setFormattedDTValue(null)
        setDTValue(null);
        setChangesHappended(false);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleCancelClick = () => {
        // Nothing typed yet - just reset without nagging.
        if (!hasPreview && !isScheduled && selectedIds.length === 0) {
            resetForm();
            return;
        }
        setOpenAlert(true);
    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);
        if (confirmed) resetForm();
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


    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{
                backgroundColor: "#f2f2f2", px: 2, py: 1,
                borderRadius: "10px 10px 10px 0px",
                borderBottom: "1px solid #ddd", mb: 0.13,
            }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                            <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", mr: 0.8 }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                            <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Notification</Typography>
                        </Box>

                        <Chip
                            size="small"
                            icon={isScheduled
                                ? <ScheduleSendOutlinedIcon sx={{ fontSize: 16 }} />
                                : <SendOutlinedIcon sx={{ fontSize: 16 }} />}
                            label={isScheduled ? "Scheduled" : "Sends instantly"}
                            sx={{
                                mr: 2,
                                display: { xs: "none", sm: "inline-flex" },
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "8px",
                                border: isScheduled ? "1px solid #FFD9A0" : "1px solid #CBE3B4",
                                backgroundColor: isScheduled ? "#FFF7E6" : "#F1F8E9",
                                color: isScheduled ? "#B36A00" : "#4E7A2E",
                                "& .MuiChip-icon": { color: "inherit" },
                            }}
                        />
                    </Grid>
                </Grid>
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
                        {/* Reach banner — who this actually lands on */}
                        <Box sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.2,
                            p: 1.5,
                            mb: 2.5,
                            borderRadius: "10px",
                            border: audienceReady ? "1px solid #DCEDC8" : "1px solid #FFE3B0",
                            backgroundColor: audienceReady ? "#F5FAF0" : "#FFFAF0",
                        }}>
                            {audienceReady
                                ? <GroupsOutlinedIcon sx={{ fontSize: 18, color: "#4E7A2E", mt: "1px" }} />
                                : <GroupsOutlinedIcon sx={{ fontSize: 18, color: "#B36A00", mt: "1px" }} />}
                            <Box>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: audienceReady ? "#4E7A2E" : "#B36A00" }}>
                                    {audienceSummary}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#5B6472", mt: 0.2 }}>
                                    {isScheduled
                                        ? `Goes out on ${formattedDTValue}.`
                                        : "Push notifications are delivered straight away and cannot be recalled."}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Audience block */}
                        <Box sx={{
                            backgroundColor: "#FAFBFC",
                            border: "1px solid #EDEFF3",
                            borderRadius: "10px",
                            p: 1.5,
                            mb: 2.5,
                        }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                    <Typography sx={fieldLabelSx}>
                                        Send to <span style={requiredSx}>*</span>
                                    </Typography>
                                    <Autocomplete
                                        disablePortal
                                        options={["Everyone", "Students", "Teachers"]}
                                        value={selectedRecipient}
                                        onChange={handleRecipientChange}
                                        sx={{
                                            width: "100%",
                                            "& .MuiAutocomplete-inputRoot": { height: "40px", backgroundColor: "#fff" },
                                        }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    height: "100%",
                                                    fontSize: "6px",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li
                                                {...props}
                                                style={{ ...props.style, fontSize: "15px" }}
                                                className="classdropdownOptions"
                                            >
                                                {option}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        endAdornment: params.InputProps.endAdornment,
                                                        sx: { paddingRight: 0, height: "40px", fontSize: "14px" },
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {selectedRecipient === "Students" && (
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <Typography sx={fieldLabelSx}>
                                            Classes &amp; sections <span style={requiredSx}>*</span>
                                        </Typography>
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
                                                    color: selectedIds.length ? "#111827" : "#8A93A0",
                                                    border: "1px solid #D6DAE1",
                                                    backgroundColor: "#fff",
                                                    height: "40px",
                                                    textAlign: "left",
                                                    fontSize: "14px",
                                                    "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#fff" },
                                                }}
                                            >
                                                <Box sx={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    width: "100%",
                                                }}>
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
                                                        <MenuItem onClick={handleSelectAll} sx={{ padding: "0px", mb: 1 }}>
                                                            <Box sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                backgroundColor: "#111",
                                                                borderRadius: "3px",
                                                                boxShadow: "none",
                                                                border: "1px solid #333",
                                                                width: "100%",
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
                                                                        sx={{ px: 1, pointerEvents: "none" }}
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
                                )}
                            </Grid>
                        </Box>

                        <Typography sx={fieldLabelSx}>
                            Title <span style={requiredSx}>*</span>
                        </Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff" }}
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            required
                            placeholder="A short, clear title"
                            value={heading}
                            onChange={handleHeadingChange}
                        />
                        <Typography sx={{
                            fontSize: "11px", mt: 0.5, textAlign: "right",
                            color: heading.length >= 100 ? "#f44336" : "#8A93A0",
                        }}>
                            {`${heading.length}/100`}
                        </Typography>

                        <Typography sx={{ ...fieldLabelSx, pt: 2 }}>
                            Message <span style={requiredSx}>*</span>
                        </Typography>
                        <TextareaAutosize
                            minRows={5}
                            maxRows={10}
                            value={description}
                            onChange={handleQuestionChange}
                            placeholder="What do you want people to know?"
                            style={{
                                width: "100%",
                                fontSize: "14px",
                                border: "1px solid #D6DAE1",
                                borderRadius: "8px",
                                backgroundColor: "#fff",
                                color: "#111827",
                                resize: "none",
                                overflowY: "auto",
                                fontFamily: "inherit",
                                padding: "10px 12px",
                                boxSizing: "border-box",
                            }}
                        />
                        <Typography sx={{ fontSize: "11px", mt: 0.5, textAlign: "right", color: "#8A93A0" }}>
                            {`${description.length} characters`}
                        </Typography>

                        <Box mt={3}>
                            <Typography sx={fieldLabelSx}>
                                Schedule for later <span style={{ color: "#8A93A0", fontWeight: 400 }}>(optional)</span>
                            </Typography>
                            <ThemeProvider theme={theme}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Stack spacing={2} sx={{ minWidth: "100%" }}>
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
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: "#000",
                                                        },
                                                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                            {isScheduled && (
                                <Button
                                    size="small"
                                    startIcon={<CloseOutlinedIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => handleDateChange(null)}
                                    sx={{
                                        textTransform: "none", fontSize: "11.5px", fontWeight: 600,
                                        color: "#6B7280", mt: 0.8, px: 0.6,
                                        "&:hover": { backgroundColor: "#F7F8FA" },
                                    }}
                                >
                                    Clear schedule and send now
                                </Button>
                            )}
                        </Box>

                        <Divider sx={{ mt: 3 }} />
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{
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
                                    Clear
                                </Button>

                                <Button
                                    startIcon={isScheduled
                                        ? <ScheduleSendOutlinedIcon sx={{ fontSize: 16 }} />
                                        : <SendOutlinedIcon sx={{ fontSize: 16 }} />}
                                    sx={primaryButtonSx}
                                    disabled={!canSubmit}
                                    onClick={() => handleInsertMessageData(isScheduled ? "schedule" : "post")}
                                >
                                    {isScheduled ? "Schedule" : "Notify"}
                                </Button>
                            </Box>

                            <Dialog
                                open={openAlert}
                                onClose={() => setOpenAlert(false)}
                                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
                            >
                                <Box sx={{ p: 3, backgroundColor: "#fff", textAlign: "center" }}>
                                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                                        Clear this notification?
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                                        The title, message, audience and schedule will all be reset.
                                    </Typography>
                                    <DialogActions sx={{ justifyContent: "center", backgroundColor: "#fff", pt: 2.5, gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleCloseDialog(false)}
                                            sx={{ ...ghostButtonSx, px: 2.4 }}
                                        >
                                            Keep editing
                                        </Button>
                                        <Button onClick={() => handleCloseDialog(true)} sx={primaryButtonSx}>
                                            Clear
                                        </Button>
                                    </DialogActions>
                                </Box>
                            </Dialog>
                        </Box>
                    </Box>
                </Grid>

                {/* ── PREVIEW COLUMN ── */}
                <Grid
                    sx={{ py: 2, mt: 6.5, pr: 2 }}
                    size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Box sx={{
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        height: "75.6vh",
                        overflow: "hidden auto",
                        border: "1px solid #E6E8EC",
                    }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <NotificationsNoneOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Live Preview</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>Updates as you type</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />

                        {!hasPreview && (
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
                                    Start typing the title or message and it will show up here straight away.
                                </Typography>
                            </Box>
                        )}

                        {hasPreview && (
                            <>
                                {/* The push card as it lands on a device */}
                                <Box sx={{
                                    display: "flex",
                                    gap: 1.4,
                                    p: 1.6,
                                    borderRadius: "12px",
                                    border: "1px solid #E6E8EC",
                                    backgroundColor: "#FAFBFC",
                                    boxShadow: "0 1px 3px rgba(17,24,39,0.06)",
                                }}>
                                    <Box sx={{
                                        width: 36, height: 36, borderRadius: "10px",
                                        backgroundColor: websiteSettings.mainColor || "#3457D5",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <NotificationsActiveOutlinedIcon sx={{ fontSize: 19, color: websiteSettings.textColor || "#fff" }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
                                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", wordBreak: "break-word" }}>
                                                {heading || "Notification title"}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "#9AA3AF", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                {isScheduled ? formattedDTValue : "now"}
                                            </Typography>
                                        </Box>
                                        {description && (
                                            <Typography sx={{
                                                fontSize: "13px", color: "#4B5563", mt: 0.4,
                                                whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55,
                                            }}>
                                                {description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Delivery summary */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{
                                        fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em",
                                        textTransform: "uppercase", color: "#8A93A0", mb: 1,
                                    }}>
                                        Delivery
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                                        <Chip
                                            size="small"
                                            icon={<GroupsOutlinedIcon sx={{ fontSize: 15 }} />}
                                            label={audienceSummary}
                                            sx={{
                                                fontSize: "11.5px", fontWeight: 600, borderRadius: "8px",
                                                border: "1px solid #E6E8EC", backgroundColor: "#fff", color: "#374151",
                                                "& .MuiChip-icon": { color: "#6B7280" },
                                            }}
                                        />
                                        <Chip
                                            size="small"
                                            icon={isScheduled
                                                ? <ScheduleSendOutlinedIcon sx={{ fontSize: 15 }} />
                                                : <SendOutlinedIcon sx={{ fontSize: 15 }} />}
                                            label={isScheduled ? `Scheduled · ${formattedDTValue}` : "Sends immediately"}
                                            sx={{
                                                fontSize: "11.5px", fontWeight: 600, borderRadius: "8px",
                                                border: isScheduled ? "1px solid #FFD9A0" : "1px solid #CBE3B4",
                                                backgroundColor: isScheduled ? "#FFF7E6" : "#F1F8E9",
                                                color: isScheduled ? "#B36A00" : "#4E7A2E",
                                                "& .MuiChip-icon": { color: "inherit" },
                                            }}
                                        />
                                    </Box>

                                    {selectedRecipient === "Students" && selectedIds.length > 0 && (
                                        <Box sx={{ mt: 1.5 }}>
                                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.6 }}>
                                                {renderValue()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {!canSubmit && (
                                    <Box sx={{
                                        display: "flex", alignItems: "flex-start", gap: 0.9,
                                        mt: 2, px: 1.2, py: 1,
                                        borderRadius: "8px",
                                        backgroundColor: "#FAFBFC",
                                        border: "1px dashed #E6E8EC",
                                    }}>
                                        <VisibilityOutlinedIcon sx={{ fontSize: 15, color: "#9AA3AF", mt: "1px" }} />
                                        <Typography sx={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.5 }}>
                                            {selectedRecipient === "Students" && selectedIds.length === 0
                                                ? "Pick at least one class before sending."
                                                : "Fill in both the title and the message to enable sending."}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}