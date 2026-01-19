import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TextareaAutosize, Popper, ClickAwayListener, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { GettingGrades, postConsentForm, postMessage, postNews } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function CreateConsentFormsPage() {
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
    const [changesHappended, setChangesHappended] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState("Everyone");
    const [classData, setClassData] = useState([]);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedIds, setSelectedIds] = useState([]);
    const [gradeIds, setGradeIds] = useState([]);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [questionsValue, setQuestionsValue] = useState('');
    const [selectedSectionIds, setSelectedSectionIds] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);
    const [formattedSectionData, setFormattedSectionData] = useState("");
    const ref = useRef();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEveryone, setIsEveryone] = useState(false);
    const [expandedGrade, setExpandedGrade] = useState(null);
    const [isPreview, setIsPreview] = useState(false);

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

    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const handlePreview = () => {
        setIsPreview(true)
        setPreviewData({
            heading,
            content: questionsValue,
        });
    };

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/consentforms')
        }

    };

    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/consentforms')
        }

    };

    const handleShow = (event) => {
        setIsPreview(false)
    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/consentforms')
            console.log('Cancel confirmed');
        }
    };

    const handleQuestionChange = (event) => {
        setChangesHappended(true)
        const newValue = event.target.value;
        if (newValue.length <= 600) {
            setQuestionsValue(newValue);
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
        return selectedData.length > 0 ? selectedData.join(", ") : "Choose Class and Sections";
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

      const { gradeSections } = getGradeSectionsPayload();

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

        if (selectedIds.length === 0) {
            setMessage("Please select class & sections");
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
            if (!questionsValue.trim()) {
                setMessage("Question is required");
                setOpen(true);
                setColor(false);
                setStatus(false);
                return;
            }
        }

        setIsLoading(true);
        try {
            
            const sendData = {

                userType: userType,
                rollNumber: rollNumber,
                heading: heading,
                question: questionsValue,
                status: status,
                postedOn: status === "post" ? todayDateTime : "",
                draftedOn: status === "draft" ? todayDateTime : "",
                consentGradeSection: gradeSections
            };

            const res = await axios.post(postConsentForm, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Data Added successfully");
            setHeading("");
            setSelectedIds([]);
            setQuestionsValue("")
            setPreviewData({
                heading: '',
                content: '',
            });
        } catch (error) {
            console.error("Error while inserting data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/consentforms" replace />;
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
                borderBottom: "1px solid #ddd",
                px: 2,
                width: "100%",
                py: 1.5,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Consent Form</Typography>
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

                        <Grid container spacing={2}>
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
                                {isPreview &&
                                    <Box onClick={handleShow} sx={{ fontSize: "13px", ml: 0, mt: 0.5, cursor: "pointer", color: "#777", textDecoration: "underline" }}>Show selected items ᐅ</Box>
                                }
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>

                            </Grid>
                        </Grid>
                        <Typography sx={{ mt: 2 }}>Add Heading</Typography>
                        <TextField
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            value={heading}
                            onChange={handleHeadingChange}
                            sx={{ backgroundColor: "#fff" }}
                        />
                        <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                            {`${heading.length}/100`}
                        </Typography>
                        <Box>
                            <Box sx={{ my: 2, }}>
                                <Typography>Add Consent Question</Typography>
                                <TextareaAutosize
                                    value={questionsValue}
                                    onChange={handleQuestionChange}
                                    style={{
                                        width: "100%",
                                        height: "100px",
                                        fontSize: "16px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        resize: "none",
                                        overflowY: "auto",
                                        padding: "10px",
                                        boxSizing: "border-box",
                                    }}
                                />
                                <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                                    {`${questionsValue.length}/600`}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 22, }}>
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
                                        onClick={() => handleInsertNewsData('post')}>
                                        Publish
                                    </Button>
                                </Grid>
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

                            <Box
                                sx={{
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: "8px",
                                    p: 2,
                                    border: "1px solid #ddd",
                                    boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
                                }}
                            >
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                                        Selected Class & Sections
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
                            </Box>
                        }
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
                            </Box>
                        }
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
