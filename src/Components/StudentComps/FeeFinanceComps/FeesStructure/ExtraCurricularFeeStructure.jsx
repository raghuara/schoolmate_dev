import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ClearIcon from '@mui/icons-material/Clear';
import dayjs from 'dayjs';
import { ecaFee, ecaFeeFetch } from '../../../../Api/Api';
import axios from 'axios';


export default function ExtraCurricularFeeStructure() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber
  const dispatch = useDispatch();
  const token = "123";
  const grades = useSelector(selectGrades);
  const [selectedGrade, setSelectedGrade] = useState(grades?.[0]?.sign || null);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [openCal, setOpenCal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [gradeFees, setGradeFees] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [ecaFetch, setEcaFetch] = useState([]);


  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const [fees, setFees] = useState({
    activityName: '',
    activityCategory: '',
    paymentStatus: "Paid",
    gradeAmounts: {},
    dueDate: null,
  });

  const handleChange = (key, value) => {
    setFees((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGradeAmountChange = (grade, value) => {
    if (!/^\d{0,8}$/.test(value)) return;

    setFees((prev) => ({
      ...prev,
      gradeAmounts: {
        ...prev.gradeAmounts,
        [grade]: value,
      },
    }));
  };

  const handleReset = () => {
    setFees({
      activityName: '',
      activityCategory: '',
      paymentStatus: null,
      gradeAmounts: {},
      dueDate: null,
    });
  };

  const hasAtLeastOneFee = () => {
    return Object.values(fees.gradeAmounts || {}).some(
      (amount) => Number(amount) > 0
    );
  };
  

  const formatDate = (d) => (d ? dayjs(d).format('DD-MM-YYYY') : '');


  useEffect(() => {
    getEcaFees()
  }, [selectedYear]);

  const getEcaFees = async () => {
    try {
      const res = await axios.get(ecaFeeFetch, {
        params: {
          Year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEcaFetch(res.data)
    } catch (error) {
      console.error("Error data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const buildGradePayload = () => {
    const payload = {};

    grades.forEach((grade) => {
      payload[grade.sign.toLowerCase()] =
        Number(fees.gradeAmounts[grade.sign]) || 0;
    });

    return payload;
  };


  const handleSubmit = async () => {

    if (!fees.activityName.trim()) {
      setMessage("Activity Name is required");
      setOpen(true);
      setColor(false);
      setStatus(false);
      return;
    }

    if (!fees.activityCategory.trim()) {
      setMessage("Activity Category is required");
      setOpen(true);
      setColor(false);
      setStatus(false);
      return;
    }

    if (!fees.paymentStatus) {
      setMessage("Payment Status is required");
      setOpen(true);
      setColor(false);
      setStatus(false);
      return;
    }

    if (fees.paymentStatus === "Paid" && !hasAtLeastOneFee()) {
      setMessage("Please add fee amount for at least one class");
      setOpen(true);
      setColor(false);
      setStatus(false);
      return;
    }

    setIsLoading(true);

    try {
      const gradePayload = buildGradePayload();

      const sendData = {
        RollNumber: rollNumber,
        year: selectedYear,
        activityCategory: fees.activityCategory,
        activityName: fees.activityName,

        ...(fees.paymentStatus === "Paid" ? gradePayload : {}),

        dueDate: fees.dueDate
          ? dayjs(fees.dueDate).format("YYYY-MM-DD")
          : null,

        paid: fees.paymentStatus === "Paid" ? "Y" : "N",
      };

      const res = await axios.post(ecaFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage("Data Added successfully");
      handleReset();
      getEcaFees();


    } catch (error) {
      const apiMsg = error?.response?.data?.message;

      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage(apiMsg || "Failed to save fee structure");
    } finally {
      setIsLoading(false);
    }
  };

  if (!grades?.length) return null;
  return (
    <Box>
      <Box sx={{ width: "100%", }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        {isLoading && <Loader />}
        <Box sx={{ position: "fixed", backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13, zIndex: "1200", width: "100%" }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Create Extracurricular Activity Fee </Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Typography sx={{ fontSize: "16px", mr: 2 }}>
                Select Academic Year
              </Typography>

              <Autocomplete
                size="small"
                options={academicYears}
                sx={{ width: 200 }}
                value={selectedYear}
                onChange={(e, newValue) => setSelectedYear(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "5px",
                        fontSize: 14,
                        height: 35,
                      },
                    }}
                  />
                )}
              />
            </Grid>

          </Grid>
        </Box>
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>
          <Box sx={{ border: "1px solid #CCC", borderRadius: "5px", mt: 2 }}>
            <Box>
              <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                <Grid size={{ lg: 3 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: "600" }}>Activity Name</Typography>
                  <TextField
                    size="small"
                    value={fees.activityName}
                    onChange={(e) => handleChange("activityName", e.target.value)}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "5px",
                        fontSize: 14,
                      },
                      width: "100%"
                    }}
                  />
                </Grid>
                <Grid size={{ lg: 3 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Activity Category</Typography>
                  <TextField
                    size="small"
                    value={fees.activityCategory}
                    onChange={(e) => handleChange('activityCategory', e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '5px',
                        fontSize: 14,
                      },
                      width: '100%',
                    }}
                  />
                </Grid>
                <Grid size={{ lg: 3 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: "600" }}>
                    Payment Status
                  </Typography>

                  <Autocomplete
                    size="small"
                    options={["Paid", "Unpaid"]}
                    value={fees.paymentStatus}
                    onChange={(e, newValue) => handleChange("paymentStatus", newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "5px",
                            fontSize: 14,
                          },
                          width: "100%",
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ lg: 3 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Add due date</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      open={openCal}
                      onClose={() => setOpenCal(false)}
                      value={fees.dueDate}
                      onChange={(newValue) => {
                        handleChange("dueDate", newValue);
                        setOpenCal(false);
                      }}
                      disablePast
                      views={['year', 'month', 'day']}
                      renderInput={() => null}
                      sx={{
                        opacity: 0,
                        pointerEvents: 'none',
                        width: "0px",
                      }}
                      slotProps={{
                        day: {
                          sx: (theme) => ({
                            '&.Mui-selected': {
                              backgroundColor: `${websiteSettings.mainColor} !important`,
                              color: '#000',
                              border: `1px solid ${websiteSettings.mainColor}`,
                            },
                            '&.MuiPickersDay-today': {
                              border: `1px solid ${websiteSettings.mainColor}`,
                              color: '#000',
                            },
                            '&.Mui-selected.MuiPickersDay-today': {
                              backgroundColor: `${websiteSettings.mainColor} !important`,
                              border: `1px solid ${websiteSettings.mainColor}`,
                              color: '#000',
                            },
                          }),
                        },
                      }}
                    />

                    <Button sx={{
                      width: '150px',
                      height: '35px',
                      backgroundColor: '#F3E5F5',
                      textTransform: "none",
                      color: "#8600BB",

                    }}
                      onClick={() => setOpenCal(true)}
                    >
                      {fees.dueDate ? formatDate(fees.dueDate) : "Add Due Date"}
                      <CalendarMonthIcon style={{ color: "#8600BB", marginLeft: "10px", fontSize: '20px' }} />
                    </Button>
                    {fees.dueDate ? (
                      <Tooltip title="Clear Due Date">
                        <IconButton sx={{
                          width: '33px',
                          height: '33px',
                          transition: 'color 0.3s, background-color 0.3s',
                          '&:hover': {
                            color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                          },
                        }} onClick={() => handleChange("dueDate", null)} >
                          <HighlightOffIcon style={{ color: "red" }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: "33px" }}>
                      </Box>
                    )}
                  </LocalizationProvider>
                </Grid>
              </Grid>
              {fees.paymentStatus === "Paid" &&
                <Grid container spacing={2} sx={{ backgroundColor: "#FFE5E5", p: 3, borderBottomLeftRadius:"5px", borderBottomRightRadius:"5px" }}>
                  {grades.map((grade, gIndex) => (
                    <Grid size={{ lg: 1.5 }} key={gIndex}>
                      <Typography
                        sx={{
                          color: "red",
                          fontSize: "12px",
                          mb: 0.5,
                          ml: 0.5
                        }}
                      >
                        {grade.sign}
                      </Typography>
                      <TextField
                        size="small"
                        value={fees.gradeAmounts[grade.sign] || ""}
                        onChange={(e) => handleGradeAmountChange(grade.sign, e.target.value)}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              ₹
                            </InputAdornment>
                          ),
                          inputMode: "numeric",
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 33,
                            fontSize: 14,
                            borderRadius: "5px",
                            backgroundColor: "#F6F6F8"
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              }
            </Box>

          </Box>
          <Box sx={{ display: "flex", justifyContent: "end", py: 2 }}>
            <Button
              onClick={handleReset}
              sx={{
                border: "1px solid #000",
                borderRadius: "30px",
                textTransform: "none",
                width: "100px",
                height: "30px",
                color: "#000"
              }}>
              Reset All
            </Button>
            <Button
              onClick={handleSubmit}
              sx={{
                backgroundColor: websiteSettings.mainColor,
                borderRadius: "30px",
                textTransform: "none",
                ml: "10px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                border: "1px solid rgba(0,0,0,0.1)",
                px: 3,
                height: "30px",
                color: websiteSettings.textColor
              }}>
              Apply
            </Button>
          </Box>

          <Typography sx={{ mb: 0.5, fontWeight: "600" }}>Extra Curricular Activity Fee</Typography>

          {ecaFetch?.length === 0 ? (
            <Box
              sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "10px",
                py: 5,
                px: 4,
                textAlign: "center",
                mt: 2
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#333",
                  mb: 1,
                }}
              >
                No ECA activities available
              </Typography>

              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#666",
                  maxWidth: "420px",
                  mx: "auto",
                }}
              >
                ECA activities have not been configured for the selected academic year.
                Please check back later or create a new activity.
              </Typography>
            </Box>

          ) : (
            ecaFetch.map((activity) => (
              <>
                <Box
                  sx={{
                    bgcolor: "#7B1FA2",
                    color: "#fff",
                    fontSize: "13px",
                    mt: "10px",
                    px: 3,
                    py: 0.2,
                    ml: "15px",
                    fontWeight: 600,
                    borderTopLeftRadius: "7px",
                    borderTopRightRadius: "7px",
                    width: "fit-content",
                  }}
                >
                  {activity.activityCategory} - {activity.activityName}
                </Box>
                <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>

                  <TableContainer
                    sx={{
                      border: "1px solid #E8DDEA",
                      backgroundColor: "#fff",
                      boxShadow: "none",
                      borderBottom: "none"
                    }}
                  >
                    <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                            Activity Name
                          </TableCell>
                          <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                            Activity Category
                          </TableCell>
                          <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                            Payment Status
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", backgroundColor: "#faf6fc" }}>
                            Due Date
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                            {activity.activityName}
                          </TableCell>

                          <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                            {activity.activityCategory}
                          </TableCell>
                          <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                            {activity.paid === "Y" ? "Paid" : "Unpaid"}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center" }}>
                            {formatDate(activity.dueDate)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {activity.paid === "Y" &&
                    <Box sx={{ backgroundColor: "#FFE5E5", p: 3, border: "1px solid #E8DDEA", borderTop: "none" }}>
                      <Grid container spacing={2}>
                        {Object.entries(activity.grades || {}).map(
                          ([gradeKey, amount]) => (
                            <Grid size={{ lg: 1.5 }} key={gradeKey}>
                              <Typography
                                sx={{
                                  color: "red",
                                  fontSize: "12px",
                                  mb: 0.5,
                                }}
                              >
                                {gradeKey.toUpperCase()}
                              </Typography>
                              <Box sx={{ border: "1px solid #0000003A", borderRadius: "5px", height: "30px", backgroundColor: "#F6F6F8", px: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                ₹ {amount}
                              </Box>

                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  }

                </Box>
              </>
            )))}
        </Box>

      </Box>

    </Box >
  )
}
