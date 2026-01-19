import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { FindMessage, GettingGrades, postNews, updateMessage } from "../../../../Api/Api";
import SnackBar from "../../../SnackBar";
import SimpleTextEditor from "../../../EditTextEditor";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export default function MessagesApprovalEditPage() {
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
    const [gradeDetails, setGradeDetails] = useState([]);
    const [isEveryone, setIsEveryone] = useState("");
    const [isStudents, setIsStudents] = useState("");
    const [isStaffs, setIsStaffs] = useState("");
    const [isSpecific, setIsSpecific] = useState("");
    const [selectedStaffs, setSelectedStaffs] = useState("");
    const [specificUsers, setSpecificUsers] = useState("");

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const handleChange = (event) => {
        setChangesHappended(true)
        const {
            target: { value },
        } = event;

        const updatedSelectedIds = typeof value === 'string' ? value.split(',') : value;

        const gradeIds = updatedSelectedIds.join(',');
        setGradeIds(gradeIds)
        console.log('Grade IDs:', gradeIds,);

        setSelectedIds(updatedSelectedIds);

    };

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

    const handleRecipientChange = (event, value) => {
        setSelectedRecipient(value || "Everyone");
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
            navigate('/dashboardmenu/approvals/messages')
        }
    };

    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/approvals/messages')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/approvals/messages')
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
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setHeading(res.data.headLine)
            setNewsContentHTML(res.data.message)
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
                action: "accept",
                everyone: isEveryone || "",
                students: isStudents || "",
                staffs: isStaffs || "",
                specific: isSpecific || "",
                staffUserTypes: selectedStaffs || [],
                specificUsers: specificUsers || [],
            };

            const res = await axios.put(updateMessage, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Message updated and accepted successfully");

            setTimeout(() => {
                navigate("/dashboardmenu/approvals/messages");
            }, 500);

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message); 
            } else {
                setMessage("An error occurred while updating the message.");
            }

            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };
    if (userType !== "superadmin" && userType !== "admin") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }
    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                width: "100%",
                py: 1.5,
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
                    <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "7px", mt: 4.5, height: "75.6vh", overflowY: "auto", position: "relative" }}>

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

                        <Typography >Add Heading</Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff" }}
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
                        {newsStatus === "schedule" ? (
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
                        ) : (
                            <Box sx={{ height: "90px" }} />
                        )
                        }
                        <Box sx={{ mt: 12, }}>
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
                                            Accept
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
                                            Accept
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
