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
import { postAdditionalFee, GetUsersBaseDetails, additionalFeeFetch } from '../../../../Api/Api';
import axios from 'axios';
import AddAdmissionNumbersDialog from '../../../AddAdmissionNumberDialog';


export default function ExtraFeeStructure() {
  const navigate = useNavigate()
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
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber;
  const userType = user.userType;
  const [openTextarea, setOpenTextarea] = useState(false);
  const [additionalFee, setAdditionalFee] = useState([]);
  const [specificNo, setSpecificNo] = useState("");

  const handleOpenTextArea = (value) => {
    setOpenTextarea(value)
  };

  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const [fees, setFees] = useState({
    feeName: '',
    remarks: '',
    paymentStatus: null,
    amount: '',
    dueDate: null,
  });


  const handleChange = (key, value) => {
    setFees(prev => ({
      ...prev,
      [key]: value,
    }));
  };


  const handleReset = () => {
    setFees({
      feeName: '',
      remarks: '',
      paymentStatus: null,
      amount: '',
      dueDate: null,
    });
  };


  const formatDate = (d) => (d ? dayjs(d).format('DD-MM-YYYY') : '');

  useEffect(() => {
    getUsers()
  }, [selectedYear]);

  const getUsers = async () => {
    try {
      const res = await axios.get(additionalFeeFetch, {
        params: {
          Year: selectedYear,
          Status: "Approved"
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdditionalFee(res.data)
    } catch (error) {
      console.error("Error while inserting news data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async () => {

    if (!fees.feeName.trim()) {
      setMessage("Fee Name is required");
      setOpen(true);
      setStatus(false);
      return;
    }

    if (!fees.remarks.trim()) {
      setMessage("Remarks are required");
      setOpen(true);
      setStatus(false);
      return;
    }

    if (!fees.paymentStatus) {
      setMessage("Payment Status is required");
      setOpen(true);
      setStatus(false);
      return;
    }

    if (!fees.amount) {
      setMessage("Fee Amount is required");
      setOpen(true);
      setStatus(false);
      return;
    }

    setIsLoading(true);

    try {

      const sendData = {
        rollNumber,
        year: selectedYear,
        feeName: fees.feeName,
        remarks: fees.remarks,
        paid: fees.paymentStatus === "Paid" ? "Y" : "N",
        feeAmount: fees.amount ? Number(fees.amount) : null,
        dueDate: fees.dueDate
          ? dayjs(fees.dueDate).format("YYYY-MM-DD")
          : null,
      };


      const res = await axios.post(postAdditionalFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOpen(true);
      setColor(true);
      setStatus(true);

      setMessage(
        userType === "superadmin"
          ? "Additional fee applied successfully"
          : "Additional fee submitted for approval successfully"
      );

      handleReset();
      getUsers()

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
        <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13 }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Create Additional Fee </Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
              sx={{ display: "flex", alignItems: "center", justifyContent: "end" }}
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

        <Box sx={{ px: 2, pb: 2, pt: 2 }}>
          <Box sx={{ border: "1px solid #CCC", borderRadius: "5px", }}>
            <Box>
              <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                <Grid size={{ lg: 2.4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: "600" }}>Fee Name</Typography>
                  <TextField
                    size="small"
                    value={fees.feeName}
                    onChange={(e) => handleChange("feeName", e.target.value)}
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
                <Grid size={{ lg: 2.4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Remarks</Typography>
                  <TextField
                    size="small"
                    value={fees.remarks}
                    onChange={(e) => handleChange("remarks", e.target.value)}
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
                <Grid size={{ lg: 2.4 }}>
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

                <Grid size={{ lg: 2.4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Fee Amount</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={fees.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      handleChange("amount", value);
                    }}
                    slotProps={{
                      input: {
                        inputMode: "numeric",
                        maxLength: 8,
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "5px",
                        fontSize: 14,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ lg: 2.4 }}>
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
            </Box>

            <Box sx={{ display: "flex", justifyContent: "end", pb: 2, px: 2 }}>
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

          <Box>
            <Typography sx={{ mb: 0.5, fontWeight: "600", mt: 3 }}>Created Additional Fees</Typography>
            <Grid container sx={{ pb: 2 }}>
              {
                additionalFee.map((item, index) => (
                  <Grid key={item} size={{ lg: 12, md: 8, }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                      <Box sx={{ display: "flex", alignItems: "end" }}>
                        <Box
                          sx={{
                            bgcolor: "#7B1FA2",
                            color: "#fff",
                            fontSize: "13px",
                            px: 3,
                            py: 0.2,
                            ml: "15px",
                            fontWeight: 600,
                            borderTopLeftRadius: "7px",
                            borderTopRightRadius: "7px",
                            width: "fit-content",
                            height: "20px"
                          }}
                        >
                          {item.feeName}
                        </Box>

                      </Box>
                      <Box
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          mt: "30px",
                          px: 3,
                          py: 0.2,
                          ml: "15px",
                          fontWeight: 600,
                          borderTopLeftRadius: "7px",
                          borderTopRightRadius: "7px",
                          width: "fit-content",
                        }}
                      >

                        <Typography sx={{
                          fontSize: "13px", fontWeight: 600, color: "#555",
                        }} >
                          <span style={{
                            fontSize: "12px",
                            color: "#777",
                            fontWeight: 500,
                          }}>  Created By : </span>  {item.createdByRollName} - {item.createdByRollNumber}

                        </Typography>

                      </Box>
                    </Box>
                    <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                      <TableContainer
                        sx={{
                          border: "1px solid #ccc",
                          backgroundColor: "#fff",
                          boxShadow: "none",
                          borderRadius: "5px",
                          borderBottom: "none"
                        }}
                      >
                        <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center", backgroundColor: "#FFE5E5" }}>
                                Fee Name
                              </TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center", backgroundColor: "#FFE5E5" }}>
                                Remarks
                              </TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center", backgroundColor: "#FFE5E5" }}>
                                Payment Status
                              </TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center", backgroundColor: "#FFE5E5" }}>
                                Fee Amount
                              </TableCell>
                              <TableCell sx={{ borderColor: "#ccc", textAlign: "center", backgroundColor: "#FFE5E5" }}>
                                Due Date
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow key={item.id}>
                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center" }}>
                                {item.feeName}
                              </TableCell>

                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center" }}>
                                {item.remarks}
                              </TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center" }}>
                                {item.paid === "Y" ? "Paid" : "Unpaid"}
                              </TableCell>

                              <TableCell sx={{ borderRight: 1, borderColor: "#ccc", textAlign: "center" }}>
                                {item.feeAmount}
                              </TableCell>

                              <TableCell sx={{ borderColor: "#ccc", textAlign: "center" }}>
                                {formatDate(item.dueDate)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
