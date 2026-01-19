import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TextareaAutosize } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { GetConsentFormById, GettingGrades, postConsentForm, postMessage, postNews, updateConsentForm } from "../../../../Api/Api";
import SnackBar from "../../../SnackBar";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";

export default function ConsentFormDraftEditPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const location = useLocation()
    const { id } = location.state || {};
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
    const [changesHappended, setChangesHappended] = useState(false);

    const [previewData, setPreviewData] = useState({
        heading: '',
        content: '',
    });

    const websiteSettings = useSelector(selectWebsiteSettings);

    const handleGradeChange = (newValue) => {
        setChangesHappended(true)
        if (newValue) {
            setSelectedGradeId(String(newValue.id));
            setSelectedSections(newValue.sections || []);
            setSelectedSectionIds([]);
        } else {
            setSelectedGradeId(null);
            setSelectedSections([]);
            setSelectedSectionIds([]);
        }
    };
    const handleSectionChange = (event) => {
        setChangesHappended(true)
        const value = event.target.value;
        console.log("Selected Sections:", value);

        setSelectedSectionIds(Array.isArray(value) ? value : []);

        const formattedValue = value.length > 0 ? value.join(',') : "";
        sendSectionData(formattedValue);
    };



    const sendSectionData = (sectionData) => {
        console.log({ section: sectionData });
        setFormattedSectionData(sectionData)
    };

    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const handlePreview = () => {
        setPreviewData({
            heading,
            content: questionsValue,
        });
    };
    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/draft/consentforms')
        }

    };
    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/draft/consentforms')
        }
    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/draft/consentforms')
            console.log('Cancel confirmed');
        }
    };

    const handleQuestionChange = (event) => {
        setChangesHappended(true)
        setQuestionsValue(event.target.value);
    };

    useEffect(() => {
        if (!uploadedFiles && !pastedLink.trim()) {
            setFileType("");
        }
    }, [uploadedFiles, pastedLink]);

    const handleInsertNewsData = async (status) => {
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

        if (!questionsValue.trim()) {
            setMessage("Question is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                id: id,
                userType: userType,
                rollNumber: rollNumber,
                gradeId: selectedGradeId,
                section: formattedSectionData || selectedSections.join(','),
                heading: heading,
                question: questionsValue,
                postedOn: todayDateTime,
            };

            const res = await axios.put(updateConsentForm, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Consent form posted successfully");
            setTimeout(() => {
                navigate('/dashboardmenu/draft/consentforms')
            }, 500);
        } catch (error) {
            console.error("Error while inserting data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            handleInsertData(id)
        }
    }, []);

    const handleInsertData = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(GetConsentFormById, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedSections(res.data.section);
            setSelectedSectionIds(res.data.section);
            setSelectedGradeId(res.data.gradeId ? String(res.data.gradeId) : null);
            setHeading(res.data.heading)
            setQuestionsValue(res.data.question)
        } catch (error) {
            console.error('Error deleting news:', error);
        } finally {
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
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderBottom:"1px solid #ddd", 
                py: 1.5,
                px:2,
                marginTop: "-2px"
            }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Consent Forms</Typography>
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
                    <Box sx={{border:"1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "7px", mt: 4.5, height: "75.6vh", overflowY: "auto", position: "relative" }}>

                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={{ mb: 0.5 }}>Select Class</Typography>
                                <Autocomplete
                                    disablePortal
                                    options={[{ id: '0', sign: 'EVERYONE' }, ...grades]}
                                    getOptionLabel={(option) => option.sign}
                                    value={
                                        [{ id: '0', sign: 'EVERYONE' }, ...grades].find(
                                            (item) => String(item.id) === selectedGradeId 
                                        ) || null
                                    }
                                    onChange={(event, newValue) => {
                                        handleGradeChange(newValue);
                                    }}
                                    isOptionEqualToValue={(option, value) => String(option.id) === String(value?.id)} 
                                    sx={{ width: '100%' }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: '150px',
                                                backgroundColor: '#000',
                                                color: '#fff',
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
                                            placeholder="Select Class"
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: '40px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    backgroundColor:"#fff",
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
                                {selectedGradeId !== "" && selectedGradeId !== "0" && (
                                    <>
                                        <Typography sx={{ mb: 0.5, ml: 1 }}>Select Section</Typography>
                                        {/* <FormControl sx={{ width: '100%' }}>
                                            <Select
                                                multiple
                                                value={selectedSectionIds}
                                                onChange={handleSectionChange}
                                                input={<OutlinedInput />}
                                                sx={{
                                                    height: '40px',
                                                    fontSize: '15px',
                                                }}
                                                renderValue={(selected) =>
                                                    selected.join(', ')
                                                }
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            maxHeight: 250,
                                                            overflow: 'auto',
                                                            backgroundColor: '#000',
                                                            color: '#fff',
                                                            '& .MuiMenuItem-root': {
                                                                fontSize: '15px',
                                                            },
                                                        },
                                                    },
                                                }}
                                            >
                                                {selectedSections.map((section) => (
                                                    <MenuItem key={section} value={section}>
                                                        <Checkbox
                                                            checked={selectedSectionIds.includes(section)}
                                                            size="small"
                                                            sx={{
                                                                padding: '0 5px',
                                                                color: '#fff',
                                                                '&.Mui-checked': {
                                                                    color: '#fff',
                                                                },
                                                            }}
                                                        />
                                                        <Typography sx={{ fontSize: '14px', ml: 1 }}>{section}</Typography>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl> */}

                                        <FormControl sx={{ width: '100%' }}>
                                            <Select
                                                multiple
                                                displayEmpty
                                                value={selectedSectionIds.length > 0 ? selectedSectionIds : []} // Ensures correct value selection
                                                onChange={handleSectionChange}
                                                input={<OutlinedInput />}
                                                sx={{
                                                    height: '40px',
                                                    fontSize: '15px',
                                                    color: selectedSectionIds.length > 0 ? "#000" : "#aaa",
                                                    backgroundColor:"#fff",
                                                }}
                                                renderValue={(selected) => {
                                                    if (selected.length === 0) {
                                                        return (
                                                            <Typography sx={{ color: "#aaa", fontSize: "13px", fontWeight: "600" }}>
                                                                Select Section
                                                            </Typography>
                                                        );
                                                    }
                                                    return selected.join(', '); 
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            maxHeight: 250,
                                                            overflow: 'auto',
                                                            backgroundColor: '#000',
                                                            color: '#fff',
                                                            '& .MuiMenuItem-root': { fontSize: '15px' },
                                                        },
                                                    },
                                                }}
                                            >
                                                {selectedSections.map((section) => (
                                                    <MenuItem key={section} value={section}>
                                                        <Checkbox
                                                            checked={selectedSectionIds.includes(section)}
                                                            size="small"
                                                            sx={{
                                                                padding: '0 5px',
                                                                color: '#fff',
                                                                '&.Mui-checked': { color: '#fff' },
                                                            }}
                                                        />
                                                        <Typography sx={{ fontSize: '14px', ml: 1, color: '#fff' }}>
                                                            {section}
                                                        </Typography>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>



                                    </>
                                )}
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

                            <Box sx={{ mb: 2, }}>

                                <Typography>Question</Typography>

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

                            </Box>

                        </Box>

                        <Box sx={{ mt: 26, px:2 }}>
                            <Grid container spacing={3}>
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
                                                    Discard
                                                </Button>
                                            </DialogActions>
                                        </Box>

                                    </Box>
                                </Dialog>

                                <Grid
                                    sx={{display:"flex", justifyContent:"end"}}
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
                    sx={{ py: 2, mt: 6.5, pr:2 }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}>
                    <Box sx={{border:"1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75.6vh", overflowY: "auto" }}>
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
                                    sx={{ fontSize: "14px", pt: 1 }}  >
                                    {previewData.content}
                                </Typography>
                            )}

                        </Box>
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
