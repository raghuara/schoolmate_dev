import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from "@mui/material";
import RichTextEditor from "../../TextEditor";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { GettingGrades, postMessage, postNews } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import Loader from "../../Loader";

export default function EditConsentFormsPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name

    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');

    const [activeTab, setActiveTab] = useState(0);
    const [pasteLinkToggle, setPasteLinkToggle] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pastedLink, setPastedLink] = useState("");
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState('');
    const [fileType, setFileType] = useState('');


    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState("Everyone");

    const [classData, setClassData] = useState([]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [gradeIds, setGradeIds] = useState([]);

    const handleChange = (event) => {
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
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const handleRichTextChange = (htmlContent) => {
        setNewsContentHTML(htmlContent);
    };


    const handlePreview = () => {
        setPreviewData({
            heading,
            content: newsContentHTML,
        });
    };

    function isYouTubeLink(url) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|(?:watch\?v=|.+\/videoseries\?v=))|youtu\.be\/)[^&?\/\s]+/;
        return youtubeRegex.test(url);
    }


    const handleCancelClick = () => {
        setOpenAlert(true);
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
            const formattedDateTime = newDTValue.format('DD-MM-YYYY HH:mm');
            setDTValue(formattedDateTime);
            console.log("setDTValue", formattedDateTime)
        } else {
            setDTValue(null);
        }
    };

    useEffect(() => {
        if (!uploadedFiles && !pastedLink.trim()) {
            setFileType("");
        }
    }, [uploadedFiles, pastedLink]);

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


    const handleInsertNewsData = async (status) => {
        setIsLoading(true);

        try {
            const sendData = {
                headLine: heading,
                message: newsContentHTML,
                userType: userType,
                rollNumber: rollNumber,
                status: status,
                recipient: selectedRecipient,
                gradeIds: gradeIds,
                postedOn: status === "post" ? todayDateTime : "",
                scheduleOn: status === "schedule" ? DTValue : "",
                draftedOn: status === "draft" ? todayDateTime : "",
                updatedOn: "",
            };

            const res = await axios.post(postMessage, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Message created successfully");
            setTimeout(() => {
                navigate('/dashboardmenu/messages')
            }, 500);
            console.log("Response:", res.data);
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    if (userType === "empty") {
        return <Navigate to="/dashboardmenu/consentforms" replace />;
    }
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
                width: "100%",
                py: 1.5,
                marginTop: "-2px"
            }}>
                <Link style={{ textDecoration: "none" }} to="/dashboardmenu/messages">
                    <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                </Link>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Message</Typography>
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
                    <Box sx={{ backgroundColor: "#fbfbfb", p: 2, borderRadius: "7px", mt: 4.5, maxHeight: "75.6vh", overflowY: "auto" }}>

                        {/* <Typography sx={{ mb:0.5}}>Select</Typography> */}
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
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={{ mb: 0.5, ml: 1 }}>Select Class</Typography>
                                <FormControl sx={{ width: '100%' }}>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedIds}
                                        onChange={handleChange}
                                        sx={{
                                            height: "40px",
                                            fontSize: '15px',
                                        }}
                                        input={<OutlinedInput />}
                                        renderValue={(selected) =>
                                            classData
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
                                        {classData.map((item) => (
                                            <MenuItem key={item.id} value={item.id} sx={{
                                                fontSize: '15px !important',
                                            }} >
                                                <Checkbox checked={selectedIds.includes(item.id)} size="small" sx={{
                                                    padding: '0 5px',
                                                    color: "#fff",
                                                    width: '18px',
                                                    height: '18px',
                                                    '&.Mui-checked': {
                                                        color: '#fff',
                                                    },
                                                }} />
                                                <Typography sx={{ fontSize: "14px", ml: 1 }}>{item.sign}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
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


                        <Typography sx={{ pt: 3 }}>Add Description</Typography>
                        <RichTextEditor
                            onContentChange={handleRichTextChange}
                        />

                        <Box mt={2}>
                            <Typography>Schedule Post</Typography>
                            <ThemeProvider theme={theme}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Stack spacing={2} sx={{ minWidth: 305 }}>
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
                                        lg: 5
                                    }}>
                                    <Button
                                        variant="outlined"
                                        disabled={!!DTValue}
                                        sx={{
                                            textTransform: 'none',
                                            width: "120px",
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            py: 0.2,
                                            border: '1px solid black',
                                            color: 'black',
                                            fontWeight: "600",
                                        }}
                                        onClick={() => handleInsertNewsData('draft')}>
                                        Save as Draft
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
                                    <DialogTitle sx={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        backgroundColor: '#333',
                                    }}>
                                        Are you sure?
                                    </DialogTitle>
                                    <DialogContent sx={{
                                        textAlign: 'center',
                                        color: 'white',
                                        backgroundColor: '#333',
                                    }}>
                                        <p>Do you really want to cancel? Your changes might not be saved.</p>
                                    </DialogContent>
                                    <DialogActions sx={{
                                        justifyContent: 'center',
                                        backgroundColor: '#333',
                                    }}>
                                        <Button
                                            onClick={() => handleCloseDialog(false)}
                                            sx={{
                                                textTransform: 'none',
                                                width: "80px",
                                                borderRadius: '30px',
                                                fontSize: '16px',
                                                py: 0.2,
                                                border: '1px solid white',
                                                color: 'white',
                                                fontWeight: "600",
                                            }}
                                        >
                                            No
                                        </Button>
                                        <Button
                                            onClick={() => handleCloseDialog(true)}
                                            sx={{
                                                textTransform: 'none',
                                                backgroundColor: websiteSettings.mainColor,
                                                width: "80px",
                                                borderRadius: '30px',
                                                fontSize: '16px',
                                                py: 0.2,
                                                color: websiteSettings.textColor,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Yes
                                        </Button>
                                    </DialogActions>
                                </Dialog>



                                {!DTValue && (
                                    <Grid
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
                                            onClick={() => handleInsertNewsData('post')}>
                                            Publish
                                        </Button>
                                    </Grid>
                                )}
                                {DTValue && (
                                    <Grid
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
                                            onClick={() => handleInsertNewsData('schedule')}>
                                            Schedule
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                    </Box>
                </Grid>


                <Grid
                    sx={{ py: 2, mt: 6.5 }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}>
                    <Box sx={{ backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75.6vh", overflowY: "auto" }}>
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
