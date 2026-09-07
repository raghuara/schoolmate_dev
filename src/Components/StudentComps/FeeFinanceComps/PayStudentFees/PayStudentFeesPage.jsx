import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import SearchIcon from '@mui/icons-material/Search';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import avatarImage from '../../../../Images/PagesImage/avatar.png'
import axios from 'axios';
import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import { StudentGridSkeleton } from "./BillingSkeletons";
import { findStudents, GetStudentsInformation } from '../../../../Api/Api';

export default function PayStudentFeePage() {
  const token = "123";
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [openCal, setOpenCal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeSign, setSelectedGradeSign] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
  const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
  const [filteredData, setFilteredData] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);

  useEffect(() => {
    if (grades && grades.length > 0) {
      setSelectedGradeId(grades[0].id);
      setSelectedSection(grades[0].sections[0]);
    }
  }, [grades]);

  const handleGradeChange = (newValue) => {
    if (newValue) {
      setSelectedGradeId(newValue.id);
      setSelectedGradeSign(newValue.sign);
      setSelectedSection(newValue.sections[0]);
    } else {
      setSelectedGradeId(null);
      setSelectedSection(null);
    }
  };

  const handleSectionChange = (event, newValue) => {
    setSelectedSection(newValue?.sectionName || null);
  };

  const handlePayClick = (rollNumber) => {
    navigate("/dashboardmenu/fee/billing", {state:{rollNumber:rollNumber}})
  }

  useEffect(() => {
    fetchAllData()
  }, [selectedSection, selectedGradeId]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudents, {
        params: {
          gradeId: selectedGradeId || 131,
          section: selectedSection,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudentDetails(res.data.students)
    } catch (error) {
      console.error("Error fetching student data:", error);

    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = studentDetails.filter((student) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    return (
      student.rollNumber?.toString().toLowerCase().includes(query) ||
      student.name?.toLowerCase().includes(query)
    );
  });


  return (
    <Box>
      <Box sx={{ width: "100%", }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        <Box sx={{ backgroundColor: DASH.canvas, px: 2, py: 1.5, borderBottom: `1px solid ${DASH.line}` }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
              </IconButton>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "20px", color: DASH.ink, lineHeight: 1.2 }}>Pay Student Fees</Typography>
                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, whiteSpace: "nowrap" }}>Pick a student to collect or record a payment</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TextField
                variant="outlined"
                placeholder="Search student by roll number or name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: {
                    padding: "0 5px",
                    borderRadius: RADIUS,
                    height: 34,
                    fontSize: "12.5px",
                    width: "270px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: "28px",
                    paddingRight: "3px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: DASH.line },
                    "&:hover fieldset": { borderColor: DASH.faint },
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: websiteSettings.mainColor,
                  },
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }} sx={{ display: "flex", alignItems: "center" }}>

              <Autocomplete
                disablePortal
                options={grades}
                getOptionLabel={(option) => option.sign}
                value={grades.find((item) => item.id === selectedGradeId) || null}
                onChange={(event, newValue) => {
                  handleGradeChange(newValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                sx={{ width: "150px", mr: "15px" }}
                PaperComponent={(props) => (
                  <Paper
                    {...props}
                    style={{
                      ...props.style,
                      maxHeight: "150px",
                      backgroundColor: "#000",
                      color: "#fff",
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
                        height: 34,
                        fontSize: "12.5px",
                        fontWeight: 600,
                        borderRadius: RADIUS,
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: DASH.line },
                        "&:hover fieldset": { borderColor: DASH.faint },
                        "&.Mui-focused fieldset": { borderColor: "#E30053", borderWidth: "1px" },
                      },
                    }}
                  />
                )}
              />
              <Autocomplete
                disablePortal
                options={sections}
                getOptionLabel={(option) => option.sectionName}
                value={
                  sections.find((option) => option.sectionName === selectedSection) ||
                  null
                }
                onChange={handleSectionChange}
                isOptionEqualToValue={(option, value) =>
                  option.sectionName === value.sectionName
                }
                sx={{ width: "150px" }}
                PaperComponent={(props) => (
                  <Paper
                    {...props}
                    style={{
                      ...props.style,
                      maxHeight: "150px",
                      backgroundColor: "#000",
                      color: "#fff",
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} className="classdropdownOptions">
                    {option.sectionName}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        paddingRight: 0,
                        height: 34,
                        fontSize: "12.5px",
                        fontWeight: 600,
                        borderRadius: RADIUS,
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: DASH.line },
                        "&:hover fieldset": { borderColor: DASH.faint },
                        "&.Mui-focused fieldset": { borderColor: "#E30053", borderWidth: "1px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <StudentGridSkeleton count={10} columns={7} />
          ) : (
          <TableContainer
            sx={{
              border: `1px solid ${DASH.line}`,
              borderRadius: "6px",
              maxHeight: "79vh",
              overflowY: "auto",

            }}
          >
            <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    S.No
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    Roll Number
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    Gender
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    Class
                  </TableCell>

                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    Section
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: DASH.surface, fontWeight: 700, fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: DASH.muted, py: 1.2 }}>
                    Fee Payment
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 5, borderBottom: "none" }}>
                      <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                        No students found
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                        Try a different class, section or search term.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((row, index) => (
                    <TableRow key={row.rollNumber || index}>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                        {row.rollNumber}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", color: row.name ? DASH.text : DASH.red }}>
                        {row.name || "Name not provided"}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                        Male
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                        {row.grade || "N/A"}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                        {row.section || "N/A"}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                        <Button
                          onClick={() => handlePayClick(row.rollNumber)}
                          variant="contained"
                          disableElevation
                          startIcon={<PaymentsOutlinedIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: "999px",
                            bgcolor: "#E30053",
                            color: "#fff",
                            height: 30,
                            px: 2,
                            fontSize: "12px",
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: "none",
                            whiteSpace: "nowrap",
                            "& .MuiButton-startIcon": { mr: 0.6 },
                            "&:hover": { bgcolor: "#C40047", boxShadow: "0 2px 8px rgba(227,0,83,0.25)" },
                          }}
                        >
                          Pay Fee
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>

            </Table>
          </TableContainer>
          )}

        </Box>
      </Box>
    </Box>
  )
}
