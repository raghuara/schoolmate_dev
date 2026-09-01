import { Box } from '@mui/system'
import { selectAcademicYear } from "../../../../Redux/Slices/academicYearSlice";
import { APPROVAL_SUBMENUS, approvalRoleFor, selectApprovalMatrix } from "../../../../Redux/Slices/approvalMatrixSlice";
import { selectUserTypeID } from "../../../../Redux/Slices/AuthSlice";
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Button, Card, CardContent, Chip, FormControlLabel, Grid, IconButton, InputAdornment, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
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
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { DASH, RADIUS, PageHeader } from '../../../DashBoardComps/dashboardTheme';

export default function ExtraCurricularFeeStructure() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber
  // createfeesstructure is an approval module: the matrix decides whether this
  // role posts straight through or has to raise a request.
  const userTypeID = useSelector(selectUserTypeID);
  const approvalMatrix = useSelector(selectApprovalMatrix);
  const canActDirect = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.FEE_STRUCTURE, userTypeID).canPublishDirect;
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
  // The academic year comes from the header - one picker for the whole site.
  const selectedYear = useSelector(selectAcademicYear);
  const [ecaFetch, setEcaFetch] = useState([]);
  const [removedGrades, setRemovedGrades] = useState(new Set());
  const [autoFill, setAutoFill] = useState(false);



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
          year: selectedYear
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
        rollNumber: rollNumber,
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
      setMessage(canActDirect ? "ECA Fee Created Successfully" : "Requested Successfully");
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
    <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%", boxSizing: "border-box" }}>
      <Box sx={{ width: "100%" }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        {isLoading && <Loader />}
        <PageHeader
          title="Create Extra-Curricular Fee"
          subtitle="Fees for activities and clubs"
          onBack={() => navigate(-1)}
          right={
            <Button
              onClick={() => navigate('created-fees')}
              startIcon={<VisibilityIcon sx={{ fontSize: 17 }} />}
              sx={{
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 700,
                height: 34,
                px: 1.8,
                borderRadius: RADIUS,
                color: DASH.text,
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
              }}
            >
              Created Fees
            </Button>
          }
        />

        <Box>
          <Box sx={{ border: `1px solid #C7D2FE`, borderRadius: RADIUS, mt: 2, overflow: 'hidden' }}>
            <Box>
              {/* Activity Details Header */}
              <Box sx={{ background: '#EEF2FF', borderBottom: `1px solid #C7D2FE`, px: 2.2, py: 1.1, display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: RADIUS, backgroundColor: '#C7D2FE', border: '1px solid #A5B4FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EditIcon sx={{ color: '#4F46E5', fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "13.5px", color: '#4338CA' }}>Activity Details</Typography>
              </Box>

              <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.6, fontSize: "12.5px", fontWeight: 600, color: DASH.text }}>Activity Name</Typography>
                  <TextField
                    size="small"
                    value={fees.activityName}
                    onChange={(e) => handleChange("activityName", e.target.value)}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 38,
                        borderRadius: RADIUS,
                        fontSize: "13px",
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: DASH.line },
                        "&:hover fieldset": { borderColor: DASH.faint },
                        "&.Mui-focused fieldset": { borderColor: DASH.blue, borderWidth: "1px" },
                      },
                      width: "100%"
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.6, fontSize: "12.5px", fontWeight: 600, color: DASH.text }}>Activity Category</Typography>
                  <TextField
                    size="small"
                    value={fees.activityCategory}
                    onChange={(e) => handleChange('activityCategory', e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 38,
                        borderRadius: RADIUS,
                        fontSize: "13px",
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: DASH.line },
                        "&:hover fieldset": { borderColor: DASH.faint },
                        "&.Mui-focused fieldset": { borderColor: DASH.blue, borderWidth: "1px" },
                      },
                      width: '100%',
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.6, fontSize: "12.5px", fontWeight: 600, color: DASH.text }}>Add due date</Typography>
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
                          height: 34,
                          fontSize: "13px",
                          borderRadius: RADIUS,
                          backgroundColor: "#fff",
                          "& fieldset": { borderColor: DASH.line },
                          "&:hover fieldset": { borderColor: DASH.faint }
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, pt: 3 }}>
            <Button
              onClick={handleReset}
              startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
              sx={{
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 700,
                height: 34,
                px: 1.8,
                borderRadius: RADIUS,
                color: DASH.text,
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
              }}>
              Reset All
            </Button>
            <Button
              onClick={handleSubmit}
              disableElevation
              sx={{
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 700,
                height: 34,
                px: 2.2,
                borderRadius: RADIUS,
                bgcolor: websiteSettings.mainColor,
                color: websiteSettings.textColor,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "none",
                "&:hover": { bgcolor: websiteSettings.mainColor, filter: "brightness(0.95)", boxShadow: "none" },
              }}>
              {canActDirect ? "Apply" : "Send for Approval"}
            </Button>
          </Box>

        </Box>

      </Box>

    </Box >
  )
}
