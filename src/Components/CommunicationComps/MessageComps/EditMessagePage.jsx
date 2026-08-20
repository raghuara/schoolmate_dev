import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Chip, Divider, Tooltip } from "@mui/material";
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
import { FindMessage, GettingGrades, postNews, updateMessage } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import SimpleTextEditor from "../../EditTextEditor";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import Loader from "../../Loader";

export default function EditMessagesPage() {
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
    const [gradeDetails, setGradeDetails] = useState([]);
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
    const [isEveryone, setIsEveryone] = useState("");
    const [isStudents, setIsStudents] = useState("");
    const [isStaffs, setIsStaffs] = useState("");
    const [isSpecific, setIsSpecific] = useState("");
    const [selectedStaffs, setSelectedStaffs] = useState("");
    const [specificUsers, setSpecificUsers] = useState("");

    dayjs.extend(utc);
    dayjs.extend(timezone);

    // What we push INTO the editor. Set once when the message loads; typing must
    // not change it, or Jodit resets the caret to the top of the box on every key.
    const [editorSeed, setEditorSeed] = useState("");

    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);

    // Whether this user's edit goes out or turns into a request is decided by the
    // approval flow configured in Access Control, not by their user type.
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const userTypeID = useSelector(selectUserTypeID);
    const approval = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.MESSAGE, userTypeID);
    const canPublishMessage = approval.canPublishDirect;

    // Names of the approvers this update has to travel through, nearest one first.
    const approverNames = approval.chain.map(
        (lvl) => approval.flow?.["level" + lvl]?.userType || ("Level " + lvl),
    );
    const approvalNote = canPublishMessage
        ? (approval.required
            ? "You are the top level approver for Messages, so your changes go out straight away."
            : "No approval flow is set for Messages yet, so your changes go out straight away.")
        : (approverNames.length
            ? "This update will be sent to " + approverNames.join(", then ") + " for approval before it goes out."
            : "This update will be sent for approval before it goes out.");

    const primaryAction = canPublishMessage
        ? (DTValue
            ? { label: "Update & Schedule", status: "schedule", icon: <ScheduleSendOutlinedIcon sx={{ fontSize: 17 }} /> }
            : { label: "Update Now", status: "post", icon: <SaveOutlinedIcon sx={{ fontSize: 17 }} /> })
        : { label: "Send Update for Approval", status: DTValue ? "schedule" : "post", icon: <SendOutlinedIcon sx={{ fontSize: 17 }} /> };

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
                    id: id,
                    academicYear: academicYear || '',
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setHeading(res.data.headLine)
            setNewsContentHTML(res.data.message)
            setEditorSeed(res.data.message || "")
            setNewsStatus(res.data.status)
            setIsEveryone(res.data.everyone)
            setIsStudents(res.data.students)
            setIsStaffs(res.data.staffs)
            setIsSpecific(res.data.specific)
            setSelectedStaffs(res.data.staffUserTypes)
            setSpecificUsers(res.data.specificUsers)
            setGradeDetails(res.data.gradeDetails)

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

        } catch (error) {
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                gradeAssignments: gradeDetails,
                scheduleOn: formattedDTValue || dateTimeValue || "",
                updatedOn: todayDateTime,
                everyone: isEveryone || "",
                students: isStudents || "",
                staffs: isStaffs || "",
                specific: isSpecific || "",
                staffUserTypes: selectedStaffs || [],
                specificUsers: specificUsers || [],
                academicYear: academicYear || "",
            };

            const res = await axios.put(updateMessage, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            if (canPublishMessage) {
                if (status === "post") {
                    setMessage("Message updated successfully");
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
                    setMessage("Update requested successfully");
                }
            }

            setTimeout(() => {
                navigate("/dashboardmenu/messages");
            }, 500);

        } catch (error) {
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                py: 1.5,
                px: 2,
                marginTop: "-2px"
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Message</Typography>
                </Box>

                <Tooltip title={approvalNote} placement="bottom-end">
                    <Chip
                        size="small"
                        icon={canPublishMessage
                            ? <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
                            : <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={canPublishMessage ? "Updates instantly" : "Needs approval"}
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
                        height: "75.6vh",
                        overflow: "hidden auto",
                        position: "relative",
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
                                    {canPublishMessage ? "You can update directly" : "Approval needed before this update goes out"}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#5B6472", mt: 0.2 }}>
                                    {approvalNote}
                                </Typography>
                            </Box>
                        </Box>

                        {/* <Typography sx={{ mb:0.5}}>Select</Typography> */}
                        {/* <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography sx={{ mb: 0.5 }}>Select Recipient</Typography>
                                <Autocomplete
                                    disablePortal
                                    options={["Everyone", 'Students', 'Teachers']}
                                    value={selectedRecipient}
                                    // disabled
                                    onChange={handleRecipientChange}
                                    disabled
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
                                            //  label="Status"
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
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                    <Typography sx={{ mb: 0.5, ml: 1 }}>Select Class</Typography>
                                    <FormControl sx={{ width: '100%' }}>
                                        <Select
                                            labelId="demo-multiple-checkbox-label"
                                            id="demo-multiple-checkbox"
                                            multiple
                                            required
                                            value={selectedIds}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.includes("selectAll")) {
                                                    const allSelected = selectedIds.length === grades.length;
                                                    handleChange({
                                                        target: {
                                                            value: allSelected ? [] : grades.map((item) => item.id),
                                                        },
                                                    });
                                                } else {
                                                    handleChange(e);
                                                }
                                            }}
                                            sx={{
                                                height: "40px",
                                                fontSize: '15px',
                                            }}
                                            input={<OutlinedInput />}
                                            renderValue={(selected) =>
                                                grades
                                                    .filter((item) => selected.includes(item.id))
                                                    .map((item) => item.sign)
                                                    .join(', ')
                                            }
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 250,
                                                        overflow: 'auto',
                                                        backgroundColor: "#000",
                                                        color: "#fff",
                                                        '& .MuiMenuItem-root': {
                                                            fontSize: '15px',
                                                        },
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value="selectAll">
                                                <Checkbox
                                                    checked={selectedIds.length === grades.length}
                                                    indeterminate={
                                                        selectedIds.length > 0 && selectedIds.length < grades.length
                                                    }
                                                    size="small"
                                                    sx={{
                                                        padding: '0 5px',
                                                        color: "#fff",
                                                        width: '18px',
                                                        height: '18px',
                                                        '&.Mui-checked': {
                                                            color: '#fff',
                                                        },
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: "14px", ml: 1, }}>Everyone </Typography>

                                            </MenuItem>
                                            <Box sx={{ px: 2 }}>
                                                <hr style={{ color: "#fff" }} />
                                            </Box>
                                            {grades.map((item) => (
                                                <MenuItem
                                                    key={item.id}
                                                    value={item.id}
                                                    sx={{
                                                        fontSize: '15px !important',
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={selectedIds.includes(item.id)}
                                                        size="small"
                                                        sx={{
                                                            padding: '0 5px',
                                                            color: "#fff",
                                                            width: '18px',
                                                            height: '18px',
                                                            '&.Mui-checked': {
                                                                color: '#fff',
                                                            },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: "14px", ml: 1 }}>{item.sign}</Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                </Grid>
                            }
                        </Grid> */}

                        <Typography sx={fieldLabelSx}>Headline <span style={requiredSx}>*</span></Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff" }}
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            value={heading}
                            placeholder="A short, clear headline"
                            onChange={handleHeadingChange}
                        />
                        {isSubmitted && !heading.trim() && (
                            <Typography sx={{ color: "#f44336", fontSize: "12px", mt: 0.5 }}>
                                This field is required
                            </Typography>
                        )}
                        <Typography sx={{ fontSize: "11px", mt: 0.5, textAlign: "right", color: heading.length >= 100 ? "#f44336" : "#8A93A0" }}>
                            {`${heading.length}/100`}
                        </Typography>


                        <Typography sx={{ ...fieldLabelSx, pt: 2 }}>Description <span style={requiredSx}>*</span></Typography>
                        <SimpleTextEditor
                            value={editorSeed}
                            onContentChange={handleRichTextChange}
                            onLiveChange={handleRichTextChange}
                        />
                        {isSubmitted && !newsContentHTML.trim() && (
                            <Typography sx={{ color: "#f44336", fontSize: "12px", mt: 0.5 }}>
                                This field is required
                            </Typography>
                        )}
                        {newsStatus === "schedule" ? (
                            <Box mt={3}>
                                <Typography sx={fieldLabelSx}>Scheduled for</Typography>
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
                        ) : (
                            <Box sx={{ height: "90px" }} />
                        )
                        }
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
                                    onClick={handleCancelClick}>
                                    Cancel
                                </Button>

                                <Tooltip title={approvalNote} placement="top">
                                    <Button
                                        startIcon={primaryAction.icon}
                                        sx={primaryButtonSx}
                                        onClick={() => handleUpdate(primaryAction.status)}>
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
                                        Discard your changes?
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                                        This message will stay as it was before you started editing.
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
                </Grid>

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
                        <Box>
                            {!heading.trim() && !newsContentHTML.trim() && (
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
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>Nothing to preview yet</Typography>
                                    <Typography sx={{ fontSize: "12px", maxWidth: "260px" }}>
                                        Your edits show up here straight away as you make them.
                                    </Typography>
                                </Box>
                            )}
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
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
