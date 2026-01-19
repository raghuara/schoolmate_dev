import { Box, Grid, IconButton, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogActions, TextField, Autocomplete, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import Loader from '../../Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { getAllExams, getExamsByGradeId, updateExamsByGradeId } from '../../../Api/Api';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CloseIcon from "@mui/icons-material/Close";
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';
import ClearIcon from '@mui/icons-material/Clear';
import SnackBar from '../../SnackBar';

export default function ExamManagementPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state) => state.auth);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const token = "123"
    const [allExamsData, setAllExamsData] = useState([])
    const [openExamPopup, setOpenExamPopup] = useState(false)
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(0);
    const [selectedGradeSign, setSelectedGradeSign] = useState(0);
    const [exam, setExam] = useState("");
    const [exams, setExams] = useState("");
    const [selectedExam, setSelectedExam] = useState("");
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const handleOpenExam = (row) => {
        setOpenExamPopup(true)
        setSelectedGradeId(row.gradeID || grades?.[0]?.id)
        setSelectedGradeSign(row.sign || grades?.[0]?.sign)
    }

    const handleCloseExam = () => {
        setOpenExamPopup(false)
    }

    const handleCancel = () => {
        fetchSelectedExam()
    }

    const handleExamChange = (e) => {
        const value = e.target.value;
        const regex = /^[A-Za-z0-9 ]*$/;
        if (regex.test(value)) {
            setExam(value);
        }
    };

    useEffect(() => {
        fetchAllExam()
    }, [])

    const fetchAllExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAllExams, {
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

    const mergedData = grades.map((grade) => {
        const found = allExamsData.find((item) => item.gradeID === String(grade.id));
        return {
            gradeID: grade.id,
            sign: grade.sign,
            exams: found ? found.exams : [],
        };
    });

    useEffect(() => {
        fetchSelectedExam()
    }, [selectedGradeId])

    const fetchSelectedExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getExamsByGradeId, {
                params: {
                    gradeId: selectedGradeId || grades?.[0]?.id || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedExam(res.data.exams || [])
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (status) => {
        setIsLoading(true);
        try {
            const sendData = {
                gradeID: String(selectedGradeId),
                exams: selectedExam,
            };

            const res = await axios.post(updateExamsByGradeId, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Updated successfully");
            setOpenExamPopup(false)
            fetchAllExam()
            fetchSelectedExam()
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
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3
                        }}>

                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>

                        <Typography sx={{ fontWeight: "600", fontSize: "20px", ml: 1 }} >Exam Management</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2 }}>
                <Grid container>
                    <Grid size={{ lg: 12 }}>
                        <TableContainer
                            sx={{
                                border: "1px solid #ccc",
                                maxHeight: "80vh",
                                overflowY: "auto",
                            }}
                        >

                            <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                                <TableHead sx={{ backgroundColor: "#f5f6fa" }}>
                                    <TableRow>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600", width:"200px" }}>Class</TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600" }}>Exams</TableCell>
                                        <TableCell sx={{ borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600", width:"100px", textAlign:"center" }}>Add / Edit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mergedData.map((row) => (
                                        <TableRow
                                            key={row.gradeID}
                                        >
                                            <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "left", }}>{row.sign}</TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center" }}>
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                    {row.exams.map((exam, idx) => (

                                                        <Chip
                                                            key={idx}
                                                            label={exam}
                                                            variant="outlined"
                                                            sx={{
                                                                fontSize: "13px",
                                                                fontWeight: 500,
                                                                borderRadius: "6px",
                                                                borderColor: "#ccc",
                                                                color: "#333",
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ borderColor: "#ccc", textAlign: "center" }}>
                                                <IconButton onClick={() => handleOpenExam(row)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid size={{ lg: 4 }}></Grid>
                </Grid>
                <Dialog
                    open={openExamPopup}
                    onClose={handleCloseExam}
                    fullWidth
                    sx={{
                        '& .MuiPaper-root': {
                            backgroundColor: '#fff',
                            boxShadow: 'none',
                            borderRadius: 0,
                            overflow: 'visible',
                            borderRadius: "10px"
                        },
                    }}
                    BackdropProps={{
                        style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    }}
                >
                    <Box sx={{ position: 'relative', display: "flex", justifyContent: "center" }}>
                        {/* Card Container */}
                        <Paper
                            sx={{
                                width: "40vw",
                                borderRadius: 2,
                                boxShadow: 3,
                                backgroundColor: "#fff",
                                position: "relative",
                            }}
                        >
                            <Typography sx={{ fontWeight: "600", backgroundColor: "#F2F2F2", borderBottom: "1px solid #ddd", p: 1, borderRadius: "5px 5px 0px 0px", }}>Edit Exam</Typography>
                            <Box sx={{ px: 2, pt: 2, pb: 4 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ lg: 12 }}>
                                        <Typography sx={{ fontWeight: "600" }}>{selectedGradeSign} - Exams</Typography>
                                    </Grid>
                                    <Grid size={{ lg: 12 }}>
                                        <Box sx={{ border: "1px solid #ccc" }}>
                                            <Grid container spacing={2} p={2} sx={{ maxHeight: "250px", overflowY: "auto", }}>
                                                {Array.isArray(selectedExam) &&
                                                    selectedExam.map((examItem, index) => (
                                                        <Grid size={{ lg: 6 }} key={index}>
                                                            <Box sx={{ display: "flex" }}>
                                                                <TextField
                                                                    sx={{ backgroundColor: "#fff" }}
                                                                    size="small"
                                                                    label={`Exam ${index + 1}`}
                                                                    fullWidth
                                                                    value={examItem}
                                                                    onChange={(e) => {
                                                                        const updatedExams = [...selectedExam];
                                                                        updatedExams[index] = e.target.value;
                                                                        setSelectedExam(updatedExams);
                                                                    }}
                                                                />
                                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <IconButton
                                                                        aria-label="remove"
                                                                        sx={{
                                                                            border: "1px solid #ccc",
                                                                            width: "30px",
                                                                            height: "30px",
                                                                            ml: 1,
                                                                            p: 0,
                                                                            backgroundColor: "#fff",
                                                                            "&:hover": { border: "1px solid #000", backgroundColor: "#f5f5f5", "& svg": { color: "#000" } },
                                                                        }}
                                                                        onClick={() => setSelectedExam(selectedExam.filter((_, i) => i !== index))}
                                                                    >
                                                                        <ClearIcon sx={{ color: "#ccc", fontSize: 18 }} />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                            </Grid>
                                            <Grid item lg={12}>
                                                <Box sx={{ display: "flex", p: 2 }}>
                                                    <TextField
                                                        sx={{ backgroundColor: "#fff" }}
                                                        id="outlined-size-small"
                                                        size="small"
                                                        fullWidth
                                                        value={exam}
                                                        onChange={handleExamChange}
                                                        placeholder="Add new exam"
                                                    />
                                                    <Button
                                                        disabled={!exam.trim()}
                                                        variant="contained"
                                                        sx={{ ml: 2, backgroundColor: websiteSettings.mainColor, color: websiteSettings.textColor }}
                                                        onClick={() => {
                                                            if (exam.trim()) {
                                                                setSelectedExam([...selectedExam, exam.trim()]);
                                                                setExam("");
                                                            }
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ lg: 12 }}>
                                        <Box sx={{ display: "flex", justifyContent: "end" }}>

                                            <Button onClick={handleCancel} sx={{ ml: 2, px: 2, borderRadius: "30px", border: "1px solid #ccc", backgroundColor: "#fff", color: websiteSettings.textColor }}>
                                                Reset
                                            </Button>
                                            <Button onClick={handleSubmit} sx={{ ml: 2, px: 3, borderRadius: "30px", backgroundColor: websiteSettings.mainColor, color: websiteSettings.textColor }}>
                                                Save
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>

                        {/* Close Button */}
                        <IconButton
                            onClick={handleCloseExam}
                            sx={{
                                width: "30px",
                                height: "30px",
                                position: 'absolute',
                                top: "-10px",
                                right: "-40px",
                                backgroundColor: "rgba(255,255,255,0.6)",
                                '&:hover': { backgroundColor: "rgba(255,255,255, 1)" }
                            }}
                        >
                            <CloseIcon style={{ color: "#000" }} />
                        </IconButton>
                    </Box>
                </Dialog>

            </Box>
        </Box>
    );
}
