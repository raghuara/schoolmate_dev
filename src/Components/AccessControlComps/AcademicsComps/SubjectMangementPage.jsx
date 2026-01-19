import { Box, Grid, IconButton, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogActions, TextField, Autocomplete, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import Loader from '../../Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { fetchAllSubjects, getAllExams, getExamsByGradeId, updateExamsByGradeId } from '../../../Api/Api';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CloseIcon from "@mui/icons-material/Close";
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';
import ClearIcon from '@mui/icons-material/Clear';
import SnackBar from '../../SnackBar';
import AddIcon from '@mui/icons-material/Add';

export default function SubjectMangementPage() {
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
  const [selectedSubject, setSelectedSubject] = useState("");
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
    setExam(e.target.value)
  }
  const handleAddSubject = (e) => {
    navigate("create");
  }

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
      setSelectedSubject(res.data.exams || [])
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
        gradeID: selectedGradeId,
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
              xs:12,
              sm:12,
              md: 6,
              lg: 6
            }}>

            <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
              <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
            </IconButton>
            <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Subject Management</Typography>
          </Grid>
          <Grid
            sx={{ display: "flex", alignItems: "center", justifyContent:"end" }}
            size={{
              xs:12,
              sm:12,
              md: 6,
              lg: 6
            }}>

            <Button
            onClick={handleAddSubject}
              variant="outlined"
              sx={{
                borderColor: "#A9A9A9",
                backgroundColor: "#000",
                py: 0.3,
                width: "120px",
                height: "30px",
                color: "#fff",
                textTransform: "none",
                border: "none",

              }}
            >
              <AddIcon sx={{ fontSize: "20px" }} />
              &nbsp;Subjects
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ p: 2 }}>
        <Grid container>
          <Grid size={{ lg: 12 }}>

            <TableContainer
              component={Paper}
              sx={{
                border: "1px solid #ccc",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <Table stickyHeader aria-label="exams table" sx={{ minWidth: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ borderRight: 1, borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600", textAlign: "center" }}
                    >
                      Class
                    </TableCell>
                    <TableCell
                      sx={{ borderRight: 1, borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600", textAlign: "center" }}
                    >
                      Exam
                    </TableCell>
                    <TableCell
                      sx={{ borderRight: 1, borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600", textAlign: "center" }}
                    >
                      Primary Subjects
                    </TableCell>
                    <TableCell
                      sx={{ borderRight: 1, borderColor: "#ccc", backgroundColor: "#faf6fc", fontWeight: "600", textAlign: "center" }}
                    >
                      Secondary Subjects
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {allExamsData.map((row) => (
                    row.exams.map((exam, idx) => (
                      <TableRow key={`${row.gradeID}-${idx}`}>
                        {/* Merge class cell using rowSpan */}
                        {idx === 0 && (
                          <TableCell
                            rowSpan={row.exams.length}
                            sx={{
                              borderRight: 1,
                              borderColor: "#ccc",
                              textAlign: "center",
                              fontWeight: "600",
                              verticalAlign: "middle"
                            }}
                          >
                            {row.grade}
                          </TableCell>
                        )}

                        <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center" }}>
                          {exam.exam}
                        </TableCell>
                        <TableCell sx={{ borderRight: 1, borderColor: "#ccc" }}>
                          {exam.primarySubjects.join(", ")}
                        </TableCell>
                        <TableCell sx={{ borderRight: 1, borderColor: "#ccc" }}>
                          {exam.secondarySubjects.length > 0
                            ? exam.secondarySubjects.join(", ")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
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
                        {Array.isArray(selectedSubject) &&
                          selectedSubject.map((examItem, index) => (
                            <Grid size={{ lg: 6 }} key={index}>
                              <Box sx={{ display: "flex" }}>
                                <TextField
                                  sx={{ backgroundColor: "#fff" }}
                                  size="small"
                                  label={`Exam ${index + 1}`}
                                  fullWidth
                                  value={examItem}
                                  onChange={(e) => {
                                    const updatedExams = [...selectedSubject];
                                    updatedExams[index] = e.target.value;
                                    setSelectedSubject(updatedExams);
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
                                    onClick={() => setSelectedSubject(selectedSubject.filter((_, i) => i !== index))}
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
                                setSelectedSubject([...selectedSubject, exam.trim()]);
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
