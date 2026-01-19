import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import SearchIcon from '@mui/icons-material/Search';
import avatarImage from '../../../../Images/PagesImage/avatar.png'
import axios from 'axios';
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
          GradeId: selectedGradeId || 131,
          Section: selectedSection,
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
        {isLoading && <Loader />}
        <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13, }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Pay Student Fees </Typography>
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
                    borderRadius: "50px",
                    height: "33px",
                    fontSize: "12px",
                    width: "270px"
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: "28px",
                    paddingRight: "3px",
                    backgroundColor: "#fff",
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
                        height: "33px",
                        fontSize: "13px",
                        fontWeight: "600",
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
                        height: "33px",
                        fontSize: "13px",
                        fontWeight: "600",
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 2 }}>
          <TableContainer
            sx={{
              border: "1px solid #E601542A",
              maxHeight: "79vh",
              overflowY: "auto",

            }}
          >
            <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    S.No
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    Roll Number
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    Gender
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    Class
                  </TableCell>

                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    Section
                  </TableCell>
                  <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", backgroundColor: "#F7DDDE" }}>
                    Fee Payment
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 3 }}>
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((row, index) => (
                    <TableRow key={row.rollNumber || index}>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center" }}>
                        {row.rollNumber}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center", color: row.name ? "inherit" : "red" }}>
                        {row.name || "Name not provided"}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center" }}>
                        Male
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center" }}>
                        {row.grade || "N/A"}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center" }}>
                        {row.section || "N/A"}
                      </TableCell>
                      <TableCell sx={{ borderRight: 1, borderColor: "#F3D1E0", textAlign: "center" }}>
                        <Button
                          onClick={() => handlePayClick(row.rollNumber)}
                          variant='outlined'
                          sx={{
                            borderRadius: "999px",
                            borderColor: "#E10052",
                            color: "#E10052",
                            height: "28px",
                            width: "100px",
                            fontSize: "12px",
                            textTransform: "none"
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

        </Box>
      </Box>
    </Box>
  )
}
