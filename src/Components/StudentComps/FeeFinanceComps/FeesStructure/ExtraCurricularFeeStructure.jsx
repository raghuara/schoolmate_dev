import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Chip, FormControlLabel, Grid, IconButton, InputAdornment, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function ExtraCurricularFeeStructure() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber
  const userType = user.userType
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
  const [removedGrades, setRemovedGrades] = useState(new Set());
  const [autoFill, setAutoFill] = useState(false);

  const isExpanded = useSelector((state) => state.sidebar.isExpanded);

  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const [fees, setFees] = useState({
    activityName: '',
    activityCategory: '',
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
    const cleaned = value.replace(/^0+(\d)/, '$1');

    if (autoFill) {
      const newAmounts = {};
      grades.forEach((g) => {
        if (!removedGrades.has(g.sign)) {
          newAmounts[g.sign] = cleaned;
        }
      });
      setFees((prev) => ({ ...prev, gradeAmounts: { ...prev.gradeAmounts, ...newAmounts } }));
    } else {
      setFees((prev) => ({
        ...prev,
        gradeAmounts: { ...prev.gradeAmounts, [grade]: cleaned },
      }));
    }
  };

  const handleRemoveGrade = (gradeSign) => {
    setRemovedGrades((prev) => new Set([...prev, gradeSign]));
    setFees((prev) => {
      const newAmounts = { ...prev.gradeAmounts };
      delete newAmounts[gradeSign];
      return { ...prev, gradeAmounts: newAmounts };
    });
  };

  const handleRestoreGrade = (gradeSign) => {
    setRemovedGrades((prev) => {
      const next = new Set(prev);
      next.delete(gradeSign);
      return next;
    });
  };

  const handleReset = () => {
    setFees({
      activityName: '',
      activityCategory: '',
      gradeAmounts: {},
      dueDate: null,
    });
    setRemovedGrades(new Set());
    setAutoFill(false);
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
      if (!removedGrades.has(grade.sign)) {
        payload[grade.sign.toLowerCase()] =
          Number(fees.gradeAmounts[grade.sign]) || 0;
      }
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

    if (!hasAtLeastOneFee()) {
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

        ...(gradePayload),

        dueDate: fees.dueDate
          ? dayjs(fees.dueDate).format("YYYY-MM-DD")
          : null,

        paid: "Y",
      };

      const res = await axios.post(ecaFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage(userType === "superadmin" ? "ECA Fee Created Successfully" : "Requested Successfully");
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
        <Box sx={{
          position: "fixed",
          top: "60px",
          left: isExpanded ? "260px" : "80px",
          right: 0,
          backgroundColor: "#f2f2f2",
          px: 2,
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
          zIndex: 1200,
          transition: "left 0.3s ease-in-out",
          overflow: 'hidden',
          py: 0.7
        }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Create Extracurricular Activity Fee </Typography>
            </Grid>

            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
              sx={{ display: "flex", alignItems: "center", justifyContent: "end"}}
            >
              <Grid container>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: "end", pr: { md: 1 } }}>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate('created-fees')}
                    sx={{
                      background: "none",
                      color: "#000",
                      textTransform: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      width: "fit-content",
                      height: 30,
                      borderRadius: "30px",
                      border: "1px solid black",
                      px: 3,
                      boxShadow: "none"
                    }}
                  >
                    Created Fees
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                  <Autocomplete
                    size="small"
                    options={academicYears}
                    sx={{ width: "170px" }}
                    value={selectedYear}
                    onChange={(e, newValue) => setSelectedYear(newValue)}
                    renderInput={(params) => (
                      <TextField
                        placeholder="Select Academic Year"
                        {...params}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "5px",
                            fontSize: 14,
                            height: 35,
                          },
                          "& .MuiOutlinedInput-input": {
                            textAlign: "center",
                            fontWeight: "600"
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

          </Grid>
        </Box>
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>
          <Box sx={{ border: "1px solid #C7D2FE", borderRadius: "5px", mt: 2, overflow: 'hidden' }}>
            <Box>
              {/* Activity Details Header */}
              <Box sx={{ background: '#EEF2FF', borderBottom: '1px solid #C7D2FE', px: 3, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '6px', backgroundColor: '#C7D2FE', border: '1px solid #A5B4FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EditIcon sx={{ color: '#4F46E5', fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#4338CA' }}>Activity Details</Typography>
              </Box>

              <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
                          sx: () => ({
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
              {/* Grade fee section header */}
              <Box sx={{ background: '#FEF2F2', borderTop: '1px solid #FECACA', borderBottom: '1px solid #FECACA', px: 3, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '6px', backgroundColor: '#FECACA', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InfoOutlinedIcon sx={{ color: '#DC2626', fontSize: 15 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#B91C1C' }}>Grade-wise Fee Amount</Typography>
                    <Typography sx={{ fontSize: 11, color: '#EF4444' }}>Setting ₹0 makes this activity free for that grade</Typography>
                  </Box>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoFill}
                      onChange={(e) => setAutoFill(e.target.checked)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#7B1FA2' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7B1FA2' },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: '#555' }}>Fill All Grades</Typography>}
                  labelPlacement="start"
                  sx={{ m: 0 }}
                />
              </Box>

              {removedGrades.size > 0 && (
                <Box sx={{ px: 3, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#999', pt:1 }}>Removed grades:</Typography>
                  {[...removedGrades].map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      onClick={() => handleRestoreGrade(g)}
                      icon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        fontSize: 12,
                        height: 22,
                        bgcolor: '#f5f5f5',
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#ede7f6', borderColor: '#7B1FA2', color: '#7B1FA2' },
                      }}
                    />
                  ))}
                </Box>
              )}

              <Grid container spacing={2} sx={{ backgroundColor: "#FFE5E5", p: 3, borderBottomLeftRadius: "5px", borderBottomRightRadius: "5px" }}>
                {grades.filter((g) => !removedGrades.has(g.sign)).map((grade) => (
                  <Grid size={{ lg: 1.5 }} key={grade.sign}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ color: "red", fontSize: "12px", ml: 0.5 }}>
                        {grade.sign}
                      </Typography>
                      <Tooltip title="Remove this grade" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveGrade(grade.sign)}
                          sx={{
                            p: 0.3,
                            color: '#bbb',
                            bgcolor: 'rgba(0,0,0,0.04)',
                            borderRadius: '50%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: '#fff',
                              bgcolor: '#f44336',
                              transform: 'scale(1.15)',
                            },
                          }}
                        >
                          <ClearIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      size="small"
                      value={fees.gradeAmounts[grade.sign] || ""}
                      onChange={(e) => handleGradeAmountChange(grade.sign, e.target.value)}
                      variant="outlined"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                          ),
                          inputMode: "numeric",
                        }
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
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", pt: 7 }}>
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
              {userType === "superadmin" ? "Apply" : "Send for Approval"}
            </Button>
          </Box>

        </Box>

      </Box>

    </Box >
  )
}
