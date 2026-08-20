import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Accordion, AccordionSummary, AccordionDetails, Popper, ClickAwayListener, FormControlLabel, InputAdornment, TextareaAutosize, Chip, Divider, Tooltip } from "@mui/material";
import RichTextEditor from "../../TextEditor";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUserTypeID } from "../../../Redux/Slices/AuthSlice";
import {
    APPROVAL_SUBMENUS, approvalRoleFor, selectApprovalMatrix,
} from "../../../Redux/Slices/approvalMatrixSlice";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import ReactPlayer from "react-player";
import { GettingGrades, GetUsersBaseDetails, postMessage, postNews } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import SimpleTextEditor from "../../EditTextEditor";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from "@mui/icons-material/Add";
// import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"; // used by the commented Save as Draft button
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AddAdmissionNumbersDialog from "../../AddAdmissionNumberDialog";

export default function CreateMessagesPage() {
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
    const [classData, setClassData] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedGrade, setExpandedGrade] = useState(null);
    const ref = useRef();
    const staffDropdownRef = useRef(null);
    const [gradeIds, setGradeIds] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [changesHappended, setChangesHappended] = useState(false);
    const [formattedDTValue, setFormattedDTValue] = useState(null);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);

    // Whether this user posts straight to live or raises a request is decided by
    // the approval flow configured in Access Control, not by their user type.
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const userTypeID = useSelector(selectUserTypeID);
    const approval = useMemo(
        () => approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.MESSAGE, userTypeID),
        [approvalMatrix, userTypeID],
    );
    const canPublishMessage = approval.canPublishDirect;

    // Names of the approvers this message has to travel through, nearest one first.
    const approverNames = approval.chain.map(
        (lvl) => approval.flow?.["level" + lvl]?.userType || ("Level " + lvl),
    );
    const approvalNote = canPublishMessage
        ? (approval.required
            ? "You are the top level approver for Messages, so whatever you send goes out straight away."
            : "No approval flow is set for Messages yet, so whatever you send goes out straight away.")
        : (approverNames.length
            ? "This message will be sent to " + approverNames.join(", then ") + " for approval before it goes out."
            : "This message will be sent for approval before it goes out.");

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
    };

    const primaryAction = canPublishMessage
        ? (DTValue
            ? { label: "Schedule Message", status: "schedule", icon: <ScheduleSendOutlinedIcon sx={{ fontSize: 17 }} /> }
            : { label: "Send Now", status: "post", icon: <PublishOutlinedIcon sx={{ fontSize: 17 }} /> })
        : { label: "Send for Approval", status: DTValue ? "schedule" : "post", icon: <SendOutlinedIcon sx={{ fontSize: 17 }} /> };
    const [isEveryone, setIsEveryone] = useState(false);
    const [specificNo, setSpecificNo] = useState("");
    const [openTextarea, setOpenTextarea] = useState(false);
    const [staffAnchorEl, setStaffAnchorEl] = useState(null);
    const [selectedStaffs, setSelectedStaffs] = useState([]);
    const [staffDropdownAnchorEl, setStaffDropdownAnchorEl] = useState(null);
    const [selectedStaffOptions, setSelectedStaffOptions] = useState([]);
    const [previewStudents, setPreviewStudents] = useState([]);
    const [previewStaffs, setPreviewStaffs] = useState([]);
    const [users, setUsers] = useState([]);

    const staffOptions = ['Teaching', 'Non-Teaching', 'Supporting'];
    const allSelected = staffOptions.every(option => selectedStaffOptions.includes(option));
    const isIndeterminate = selectedStaffOptions.length > 0 && !allSelected;

    const handleOpenTextArea = (value) => {
        setOpenTextarea(value)
    };

    // Remounting the editor is the only reliable way to clear it - Jodit keeps
    // its own DOM, so pushing an empty value down does not always reach it.
    const [editorResetKey, setEditorResetKey] = useState(0);

    const handleEveryoneChange = (event) => {
        setIsEveryone(event.target.checked);
        setSelectedStaffOptions([])
        setSelectedIds([])
        setSpecificNo('')
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
        return selectedData.length > 0 ? selectedData.join(", ") : "Select Students";
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

    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    // Stable identity so the memoised editor is not re-rendered on every keystroke.
    const handleRichTextChange = useCallback((htmlContent) => {
        setChangesHappended(true)
        setNewsContentHTML(htmlContent);
    }, []);

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/messages')
        }
    };

    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/messages')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/messages')
        }
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

    const handleInsertMessageData = async (status) => {

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
            const sendData = {
                headLine: heading,
                message: newsContentHTML,
                userType: userType,
                rollNumber: rollNumber,
                status: status,
                gradeSections: gradeSections.gradeSections,
                postedOn: status === "post" ? todayDateTime : "",
                scheduleOn: status === "schedule" ? formattedDTValue : "",
                draftedOn: status === "draft" ? todayDateTime : "",
                updatedOn: "",
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

                academicYear: academicYear || "",
            };

            const res = await axios.post(postMessage, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);

            if (canPublishMessage) {
                if (status === "post") {
                    setMessage("Message created successfully");
                } else if (status === "schedule") {
                    setMessage("Message scheduled successfully");
                } else {
                    setMessage("Draft saved successfully");
                }
            }

            if (!canPublishMessage) {
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
            setChangesHappended(false)
            setEditorResetKey((k) => k + 1);

        } catch (error) {
            setMessage("An error occurred while creating the message.");
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
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #ddd",
                px: 2,
                width: "100%",
                py: 1.5,
                marginTop: "-2px"
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Message</Typography>
                </Box>

                <Tooltip title={approvalNote} placement="bottom-end">
                    <Chip
                        size="small"
                        icon={canPublishMessage
                            ? <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
                            : <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={canPublishMessage ? "Sends instantly" : "Needs approval"}
                        sx={{
                            mr: 4,
                            display: { xs: "none", sm: "inline-flex" },
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: canPublishMessage ? "1px solid #CBE3B4" : "1px solid #FFD9A0",
                            backgroundColor: canPublishMessage ? "#F1F8E9" : "#FFF7E6",
                            color: canPublishMessage ? "#4E7A2E" : "#B36A00",
                            "& .MuiChip-icon": { color: "inherit" },
                        }}
                    />
                </Tooltip>
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
                    <Box sx={{
                        border: "1px solid #E6E8EC",
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        mt: 4.5,
                        maxHeight: "75.6vh",
                        overflow: "hidden auto",
                    }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.2,
                            p: 1.5,
                            mb: 2.5,
                            borderRadius: "10px",
                            border: canPublishMessage ? "1px solid #DCEDC8" : "1px solid #FFE3B0",
                            backgroundColor: canPublishMessage ? "#F5FAF0" : "#FFFAF0",
                        }}>
                            {canPublishMessage
                                ? <VerifiedOutlinedIcon sx={{ fontSize: 18, color: "#4E7A2E", mt: "1px" }} />
                                : <AccountTreeOutlinedIcon sx={{ fontSize: 18, color: "#B36A00", mt: "1px" }} />}
                            <Box>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: canPublishMessage ? "#4E7A2E" : "#B36A00" }}>
                                    {canPublishMessage ? "You can send directly" : "Approval needed before this is sent"}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#5B6472", mt: 0.2 }}>
                                    {approvalNote}
                                </Typography>
                            </Box>
                        </Box>

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
                        </Grid>

                        <Typography sx={{ ...fieldLabelSx, mt: 2.5 }}>Headline <span style={requiredSx}>*</span></Typography>
                        <TextField
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            value={heading}
                            placeholder="A short, clear headline"
                            sx={{ backgroundColor: "#fff", }}
                            onChange={handleHeadingChange}
                        />
                        <Typography sx={{ fontSize: "11px", mt: 0.5, textAlign: "right", color: heading.length >= 100 ? "#f44336" : "#8A93A0" }}>
                            {`${heading.length}/100`}
                        </Typography>

                        <Typography sx={{ ...fieldLabelSx, pt: 2 }}>Description <span style={requiredSx}>*</span></Typography>
                        <SimpleTextEditor
                            key={editorResetKey}
                            value=""
                            onContentChange={handleRichTextChange}
                            onLiveChange={handleRichTextChange}
                        />

                        <Box mt={3}>
                            <Typography sx={fieldLabelSx}>
                                Schedule for later <span style={{ color: "#8A93A0", fontWeight: 400 }}>(optional)</span>
                            </Typography>
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

                        <Divider sx={{ mt: 3 }} />
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                            }}>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CloseOutlinedIcon sx={{ fontSize: 16 }} />}
                                        sx={ghostButtonSx}
                                        onClick={handleCancelClick}>
                                        Cancel
                                    </Button>
                                    {/* Draft feature is no longer used - kept here in case it comes back.
                                    <Button
                                        variant="outlined"
                                        disabled={!!DTValue}
                                        startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                                        sx={ghostButtonSx}
                                        onClick={() => handleInsertMessageData('draft')}>
                                        Save as Draft
                                    </Button>
                                    */}
                                </Box>

                                <Tooltip title={approvalNote} placement="top">
                                    <Button
                                        startIcon={primaryAction.icon}
                                        sx={primaryButtonSx}
                                        onClick={() => handleInsertMessageData(primaryAction.status)}>
                                        {primaryAction.label}
                                    </Button>
                                </Tooltip>
                            </Box>

                            <Dialog
                                open={openAlert}
                                onClose={() => setOpenAlert(false)}
                                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
                            >
                                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                                        Discard this message?
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                                        Your changes have not been saved yet and will be lost.
                                    </Typography>
                                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleCloseDialog(false)}
                                            sx={{ ...ghostButtonSx, px: 2.4 }}
                                        >
                                            Keep editing
                                        </Button>
                                        <Button
                                            onClick={() => handleCloseDialog(true)}
                                            sx={primaryButtonSx}
                                        >
                                            Discard
                                        </Button>
                                    </DialogActions>
                                </Box>
                            </Dialog>
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
                    <Box sx={{ border: "1px solid #E6E8EC", backgroundColor: "#fff", p: 2, borderRadius: "12px", height: "75.6vh", overflow: "hidden auto" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <ArticleOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Live Preview</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>Updates as you type</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />

                        <Box
                            sx={{
                                backgroundColor: "#FAFBFC",
                                borderRadius: "10px",
                                p: 1.5,
                                border: "1px solid #EDEFF3",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: isEveryone ? 0 : 1.2 }}>
                                <GroupOutlinedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                                <Typography sx={{ fontWeight: 600, fontSize: "12.5px", color: "#374151" }}>
                                    Sending to
                                </Typography>
                                {isEveryone && (
                                    <Chip
                                        size="small"
                                        label="Everyone"
                                        sx={{
                                            height: "20px",
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            borderRadius: "6px",
                                            backgroundColor: "#E8F5E9",
                                            color: "#4E7A2E",
                                        }}
                                    />
                                )}
                            </Box>

                            {!isEveryone && (
                                <>
                                    <Box sx={{ mb: 1.2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "12px", color: "#6B7280" }}>
                                            Students
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", color: "#374151", mt: 0.3, wordBreak: "break-word" }}>
                                            {renderValue() || "None"}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 1.2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "12px", color: "#6B7280" }}>
                                            Staff
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", color: "#374151", mt: 0.3, wordBreak: "break-word" }}>
                                            {selectedStaffOptions && selectedStaffOptions.length > 0
                                                ? selectedStaffOptions.join(', ')
                                                : "None"}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: "12px", color: "#6B7280" }}>
                                            Specific Members
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", color: "#374151", mt: 0.3, wordBreak: "break-word" }}>
                                            {specificNo || "None"}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {!heading.trim() && !newsContentHTML.trim() ? (
                            <Box sx={{
                                height: "45vh",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                textAlign: "center",
                                color: "#9AA3AF",
                            }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 34, color: "#C9CFD8" }} />
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>Nothing to preview yet</Typography>
                                <Typography sx={{ fontSize: "12px", maxWidth: "260px" }}>
                                    Start typing the headline or description and it will show up here straight away.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {heading && (
                                    <Typography sx={{ fontWeight: "600", fontSize: "16px", wordBreak: "break-word" }}>
                                        {heading}
                                    </Typography>
                                )}

                                {newsContentHTML && (
                                    <Typography
                                        component="div"
                                        sx={{
                                            fontSize: "14px",
                                            pt: 1,
                                            wordBreak: "break-word",
                                            "& img": { maxWidth: "100%", height: "auto" },
                                            "& table": { maxWidth: "100%" },
                                        }}
                                        dangerouslySetInnerHTML={{ __html: newsContentHTML }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </Grid>



            </Grid >
        </Box >
    );
}
