import { Box, Grid, IconButton, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogActions, TextField, Autocomplete, Button, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import Loader from '../../Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { fetchAllSubjects, fetchSubjectsByID, getAllExams, getExamsByGradeId, updateExamsByGradeId, updatePrimaryAndSecondarySubjects } from '../../../Api/Api';
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import SnackBar from '../../SnackBar';
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

export default function SubjectCreatePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state) => state.auth);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const token = "123"
    const [allExamsData, setAllExamsData] = useState([])
    const [allSubjectData, setAllSubjectData] = useState([])
    const [openExamPopup, setOpenExamPopup] = useState(false)
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState([]);
    const [selectedExam, setSelectedExam] = useState([]);
    const [selectedSubjectValue, setSelectedSubjectValue] = useState("");
    const [selectedExamValue, setSelectedExamValue] = useState("");
    const [primarySubjects, setPrimarySubjects] = useState("");
    const [secondarySubjects, setSecondarySubjects] = useState("");
    const [primaryInput, setPrimaryInput] = useState("");
    const [secondaryInput, setSecondaryInput] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const handleAddPrimary = () => {
        if (primaryInput.trim() !== "") {
            setPrimarySubjects([...primarySubjects, primaryInput.trim()]);
            setPrimaryInput("");
        }
    };

    const handleAddSecondary = () => {
        if (secondaryInput.trim() !== "") {
            setSecondarySubjects([...secondarySubjects, secondaryInput.trim()]);
            setSecondaryInput("");
        }
    };

    const handleReset = () => {
        setPrimarySubjects([]);
        setSecondarySubjects([]);
    };

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleConfirmSave = async () => {
        setOpenConfirm(false);
        await handleSave();
    };


    useEffect(() => {
        fetchAllExam()
    }, [])

    const fetchAllExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchAllSubjects, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAllExamsData(res.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (grades.length > 0 && selectedGradeId === null) {
            setSelectedGradeId(grades[0].id);
        }
    }, [grades]);

    useEffect(() => {
        fetchSelectedExam()
    }, [selectedGradeId])

    const fetchSelectedExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getExamsByGradeId, {
                params: { gradeId: selectedGradeId },
                headers: { Authorization: `Bearer ${token}` },
            });
            const exams = res.data.exams || [];
            setSelectedExam(exams);
            setSelectedExamValue(exams.length > 0 ? exams[0] : "");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedGradeId) {
            fetchSelectedSubjects();
        }
    }, [selectedGradeId]);

    const fetchSelectedSubjects = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchSubjectsByID, {
                params: { gradeId: selectedGradeId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllSubjectData(res.data);

            if (res.data?.exams?.length > 0) {
                setSelectedExamValue(res.data.exams[0].exam);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedExamData = allSubjectData?.exams?.find(
        (exam) => exam.exam === selectedExamValue
    );

    const mergedExamData = {
        primarySubjects: [
            ...(selectedExamData?.primarySubjects || []),
            ...primarySubjects,
        ],
        secondarySubjects: [
            ...(selectedExamData?.secondarySubjects || []),
            ...secondarySubjects,
        ],
    };

    const handleSave = async (status) => {
        setIsLoading(true);
        try {
            const sendData = {
                gradeID: String(selectedGradeId),
                exam: selectedExamValue || "",
                ...mergedExamData,
            };

            const res = await axios.post(updatePrimaryAndSecondarySubjects, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Updated successfully");
            setOpenExamPopup(false)
            await fetchSelectedSubjects();
            setPrimarySubjects([]);
            setSecondarySubjects([]);
        } catch (error) {
            const apiMessage = error.response?.data?.message || "An unexpected error occurred.";
            setMessage(apiMessage);
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

            <Box sx={{ backgroundColor: "#f2f2f2", p: 1.5, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center", }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>

                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Create Subject</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "7px", height: "75vh", overflowY: "auto", position: "relative", }}>
                            <Grid container spacing={2} >
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 6,
                                        lg: 6
                                    }}>
                                    <Typography sx={{ mb: 0.5 }}>Select Class</Typography>
                                    <Autocomplete
                                        disablePortal
                                        size='small'
                                        options={grades}
                                        getOptionLabel={(option) => option.sign}
                                        value={grades.find((g) => g.id === selectedGradeId) || null}
                                        onChange={(event, newValue) => {
                                            setSelectedGradeId(newValue?.id || null);
                                            setPrimarySubjects([]);
                                            setSecondarySubjects([]);
                                        }}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                sx={{
                                                    bgcolor: 'black',
                                                    color: 'white',
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} style={{ backgroundColor: 'black', color: 'white', fontSize: "14px" }}>
                                                {option.sign}
                                            </li>
                                        )}
                                        renderInput={(params) =>
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '14px',
                                                    },
                                                }}
                                            />}
                                    />

                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 6,
                                        lg: 6
                                    }}>
                                    <Typography sx={{ mb: 0.5 }}>Select Exam</Typography>
                                    <Autocomplete
                                        size='small'
                                        disablePortal
                                        options={selectedExam}
                                        value={selectedExamValue || ""}
                                        onChange={(event, newValue) => {
                                            setSelectedExamValue(newValue);
                                            setPrimarySubjects([]);
                                            setSecondarySubjects([]);
                                        }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                sx={{
                                                    bgcolor: 'black',
                                                    color: 'white',
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} style={{ backgroundColor: 'black', color: 'white', fontSize: "14px" }}>
                                                {option}
                                            </li>
                                        )}
                                        renderInput={(params) =>
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '14px',
                                                    },
                                                }}
                                            />}
                                    />


                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 12
                                    }}>
                                    <Typography sx={{ mb: 0.5 }}>Add Primary Subject</Typography>
                                    <Grid container spacing={2} >
                                        <Grid
                                            size={{
                                                xs: 12,
                                                sm: 10,
                                                md: 10,
                                                lg: 10
                                            }}>

                                            <TextField
                                                id="outlined-size-small"
                                                size="small"
                                                fullWidth
                                                value={primaryInput}
                                                sx={{ backgroundColor: "#fff" }}
                                                slotProps={{
                                                    input: {
                                                        inputProps: { maxLength: 50 },
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const regex = /^[A-Za-z0-9 ]*$/;
                                                    if (regex.test(value)) {
                                                        setPrimaryInput(value);
                                                    }
                                                }}
                                            />

                                        </Grid>
                                        <Grid
                                            size={{
                                                xs: 2,
                                                sm: 2,
                                                md: 2,
                                                lg: 2
                                            }}>
                                            <Button
                                                disabled={!primaryInput}
                                                onClick={handleAddPrimary}
                                                sx={{
                                                    backgroundColor: "#fff",
                                                    border: `1px solid ${primaryInput ? "#000" : "#d3d3d3"}`,
                                                    textTransform: "none",
                                                    color: "#000",
                                                    width: "100%"
                                                }}>
                                                Add
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 12
                                    }}>
                                    <Typography sx={{ mb: 0.5 }}>Add Secondary Subject</Typography>
                                    <Grid container spacing={2} >
                                        <Grid
                                            size={{
                                                xs: 12,
                                                sm: 10,
                                                md: 10,
                                                lg: 10
                                            }}>

                                            <TextField
                                                id="outlined-size-small"
                                                size="small"
                                                fullWidth
                                                value={secondaryInput}
                                                sx={{ backgroundColor: "#fff" }}
                                                slotProps={{
                                                    input: {
                                                        inputProps: { maxLength: 50 },
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const regex = /^[A-Za-z0-9 ]*$/;
                                                    if (regex.test(value)) {
                                                        setSecondaryInput(value);
                                                    }
                                                }}
                                            />

                                        </Grid>
                                        <Grid
                                            size={{
                                                xs: 2,
                                                sm: 2,
                                                md: 2,
                                                lg: 2
                                            }}>
                                            <Button
                                                disabled={!secondaryInput}
                                                onClick={handleAddSecondary}
                                                sx={{
                                                    backgroundColor: "#fff",
                                                    border: `1px solid ${secondaryInput ? "#000" : "#d3d3d3"}`,
                                                    textTransform: "none",
                                                    color: "#000",
                                                    width: "100%"
                                                }}>
                                                Add
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Box sx={{ display: "flex", justifyContent: "end", position: "absolute", bottom: "10px", right: "10px" }}>
                                <Button
                                    onClick={handleReset}
                                    sx={{
                                        border: "1px solid #000",
                                        color: websiteSettings.textColor,
                                        borderRadius: "50px",
                                        height: "30px",
                                        width: "80px",
                                        mr: 2,
                                        textTransform: "none"
                                    }}>
                                    Reset
                                </Button>
                                <Button
                                    onClick={handleOpenConfirm}
                                    sx={{
                                        backgroundColor: websiteSettings.mainColor,
                                        color: websiteSettings.textColor,
                                        borderRadius: "50px",
                                        height: "30px",
                                        width: "80px",
                                        textTransform: "none"
                                    }}>
                                    Save
                                </Button>
                                <Dialog open={openConfirm} onClose={handleCloseConfirm}>
                                    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <ReportProblemOutlinedIcon color="warning" />
                                        Confirm Save
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Please review before saving. Once you save, you will not be able to
                                            edit or delete these subjects.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseConfirm} sx={{ textTransform: "none" }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleConfirmSave}
                                            sx={{
                                                textTransform: "none",
                                                height: "30px",
                                                width: "80px",
                                                backgroundColor: websiteSettings.mainColor,
                                                color: websiteSettings.textColor,
                                                "&:hover": { opacity: 0.9 },
                                                borderRadius: "50px"
                                            }}
                                        >
                                            Confirm
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75vh", overflowY: "auto" }}>
                            <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)" }}>Live Preview</Typography>
                            <hr style={{ border: "0.5px solid #CFCFCF" }} />
                            <TableContainer sx={{ border: "1px solid #ccc", maxHeight: "68vh", mt: 2 }}>
                                <Table stickyHeader aria-label="subjects-table" sx={{ minWidth: "100%" }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    borderRight: "1px solid #ccc",
                                                    backgroundColor: "#faf6fc",
                                                    fontWeight: 600,
                                                    textAlign: "center",
                                                }}
                                            >
                                                S.no
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: "1px solid #ccc",
                                                    backgroundColor: "#faf6fc",
                                                    fontWeight: 600,
                                                    textAlign: "center",
                                                }}
                                            >
                                                Primary Subject
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "#faf6fc",
                                                    fontWeight: 600,
                                                    textAlign: "center",
                                                }}
                                            >
                                                Secondary Subject
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(() => {
                                            const maxLength = Math.max(
                                                mergedExamData.primarySubjects.length,
                                                mergedExamData.secondarySubjects.length
                                            );

                                            if (maxLength === 0) {
                                                return (
                                                    <TableRow>
                                                        <TableCell colSpan={3} sx={{ textAlign: "center", color: "gray" }}>
                                                            No subjects available
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }

                                            return Array.from({ length: maxLength }).map((_, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: "1px solid #ccc",
                                                            textAlign: "center",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>
                                                        {mergedExamData.primarySubjects[idx] || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {mergedExamData.secondarySubjects[idx] || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ));
                                        })()}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Grid>
                </Grid>


            </Box>
        </Box>
    );
}
