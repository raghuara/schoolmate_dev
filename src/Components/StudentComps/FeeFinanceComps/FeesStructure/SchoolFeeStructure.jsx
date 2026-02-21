import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
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
import dayjs from 'dayjs';
import { getFees, schoolFee, updateSchoolFee } from '../../../../Api/Api';
import axios from 'axios';

export default function SchoolFeeStructure() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = "123";
  const user = useSelector((state) => state.auth)
  const rollNumber = user.rollNumber;
  const userType = user.userType

  const grades = useSelector(selectGrades);
  const [selectedGrade, setSelectedGrade] = useState(grades?.[0]?.sign || null);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const handleOpen = () => setOpenCal(true);
  const handleClose = () => setOpenCal(false);
  const [selectedDate, setSelectedDate] = useState();
  const [formattedDate, setFormattedDate] = useState('');
  const [openCal, setOpenCal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [gradeFees, setGradeFees] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  const [primeSchoolFeesID, setPrimeSchoolFeesID] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [hasApprovedFees, setHasApprovedFees] = useState(false);


  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const makeInitialFeesForGrades = (gradesArr = []) => {
    const initialFees = {};
    gradesArr.forEach((g) => {
      initialFees[g.sign] = [
        {
          feeName: "Admission Fee *",
          desc: "",
          amount: "",
          dueDate: null,
          mandatory: true,
          openCal: false,
        },
      ];
    });
    return initialFees;
  };

  const normalizeBackendFees = (backendFees = []) => {
    return backendFees.map((f) => ({
      feeName: f.feeDetails || "",
      desc: f.feeDescription || "",
      amount: f.feeAmount != null ? String(f.feeAmount) : "",
      dueDate: f.dueDate ? dayjs(f.dueDate) : null,
      mandatory: false,
      openCal: false,
    }));
  };

  const fetchFeesForGrade = async (gradeSign) => {
    try {
      setIsLoading(true);
      const gradeObj = grades.find((g) => g.sign === gradeSign) || {};
      const gradeId = gradeObj.id || gradeObj.gradeId || gradeObj._id || gradeSign;
      const year = new Date().getFullYear();

      const res = await axios.get(getFees, {
        params: { gradeId: gradeId, year: selectedYear, Status: "Approved" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data;
      const backendFees = data?.fees || [];

      setPrimeSchoolFeesID(data?.primeSchoolFeesID || null);

      setGradeFees((prev) => {
        const updated = { ...prev };
        updated[gradeSign] = backendFees.length ? normalizeBackendFees(backendFees) : [
          {
            feeName: "Admission Fee *",
            desc: "",
            amount: "",
            dueDate: null,
            mandatory: true,
            openCal: false,
          },
        ];
        return updated;
      });

      setHasApprovedFees(backendFees.length > 0);
      if (!backendFees.length) {
        setPrimeSchoolFeesID(null);
      }
    
    } catch (err) {
      setHasApprovedFees(false);
      console.log("Failed to save fee structure.")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (grades?.length) {
      const initial = makeInitialFeesForGrades(grades);
      setGradeFees(initial);
      const first = grades[0].sign;
      setSelectedGrade(first);
      setTabIndex(0);

      fetchFeesForGrade(first);
    }
  }, [grades]);

  useEffect(() => {
    if (!selectedGrade || !grades?.length) return;
    fetchFeesForGrade(selectedGrade);
  }, [selectedGrade]);

  const formatDate = (date) => (date ? dayjs(date).format("DD-MM-YYYY") : "");

  const total =
    gradeFees[selectedGrade]?.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0
    ) || 0;

  const handleChange = (grade, index, key, value) => {
    setGradeFees((prev) => {
      const updated = { ...prev };
      updated[grade][index][key] = value;
      return updated;
    });
  };

  const handleAddFee = (grade) => {
    setGradeFees((prev) => {
      const fees = prev[grade];
      const lastFee = fees[fees.length - 1];
      if (
        !lastFee.feeName.trim() &&
        !lastFee.desc.trim() &&
        (!lastFee.amount || Number(lastFee.amount) === 0)
      ) {
        setOpen(true)
        setStatus(false)
        setMessage("Please fill the current fee row before adding a new one.")
        setColor(false)
        return prev;
      }
      const newFee = {
        feeName: "",
        desc: "",
        amount: "",
        dueDate: null,
        mandatory: false,
        openCal: false,
      };
      return { ...prev, [grade]: [...fees, newFee] };
    });
  };

  const handleRemoveFee = (grade) => {
    setGradeFees((prev) => {
      const fees = prev[grade];
      if (fees[fees.length - 1].mandatory) return prev;
      return { ...prev, [grade]: fees.slice(0, -1) };
    });
  };

  const handleDateChange = (grade, index, newValue) => {
    setGradeFees((prev) => {
      const updated = { ...prev };
      updated[grade][index].dueDate = newValue;
      updated[grade][index].openCal = false;
      return updated;
    });
  };

  const handleClearDate = (grade, index) => {
    setGradeFees((prev) => {
      const updated = { ...prev };
      updated[grade][index].dueDate = null;
      return updated;
    });
  };

  if (!grades?.length) return null;


  const handleResetAll = () => {
    const initialFees = {};
    grades.forEach((g) => {
      initialFees[g.sign] = [
        {
          feeName: "Admission Fee *",
          desc: "",
          amount: "",
          dueDate: null,
          mandatory: true,
          openCal: false,
        },
      ];
    });
    setGradeFees(initialFees);
    setTabIndex(0);
    setSelectedGrade(grades?.[0]?.sign || null);
    setOpen(true);
    setStatus(true);
    setColor(true);
    setMessage("All fee rows reset.");
  };

  const handleSubmit = async (status) => {

    setIsLoading(true);
    try {
      const gradeObj = grades.find((g) => g.sign === selectedGrade) || {};
      const gradeId = gradeObj.id || gradeObj.gradeId || gradeObj._id || selectedGrade;
      const feesForGrade = gradeFees[selectedGrade] || [];
      const filtered = feesForGrade.filter(
        (f) => (f.feeName && f.feeName.toString().trim()) || (f.amount && Number(f.amount) > 0)
      );

      const sendData = {
        gradeId: String(gradeId),
        year: selectedYear,
        rollNumber: rollNumber,
        fees: filtered.map((f) => ({
          feeDetails: f.feeName,
          feeDescription: f.desc,
          feeAmount: Number(f.amount || 0),
          dueDate: f.dueDate ? dayjs(f.dueDate).format("YYYY-MM-DD") : null,
        })),
      };

      const res = await axios.post(schoolFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success === false) {
        setOpen(true);
        setColor(false);
        setStatus(false);
        setMessage(res.data?.message || "Failed to save fee structure.");
        return;
      }

      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage("Data Added successfully");
      await fetchFeesForGrade(selectedGrade);

    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage(apiMsg || "Failed to save fee structure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (status) => {

    setIsLoading(true);
    try {

      const gradeObj = grades.find(g => g.sign === selectedGrade) || {};
      const gradeId =
        gradeObj.id || gradeObj.gradeId || gradeObj._id || selectedGrade;

      const feesForGrade = gradeFees[selectedGrade] || [];

      const filteredFees = feesForGrade.filter(
        f =>
          f.feeName?.trim() ||
          (f.amount && Number(f.amount) > 0)
      );

      const sendData = {
        PrimeSchoolFeesID: primeSchoolFeesID,
        gradeId: String(gradeId),
        year: selectedYear,
        rollNumber: rollNumber,
        fees: filteredFees.map(f => ({
          feeDetails: f.feeName,
          feeDescription: f.desc,
          feeAmount: Number(f.amount || 0),
          dueDate: f.dueDate
            ? dayjs(f.dueDate).format("YYYY-MM-DD")
            : null,
        })),

      };

      const res = await axios.put(updateSchoolFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success === false) {
        setOpen(true);
        setColor(false);
        setStatus(false);
        setMessage(res.data?.message || "Failed to update fee structure.");
        return;
      }

      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage("Data Added successfully");
      await fetchFeesForGrade(selectedGrade);

    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage(apiMsg || "Failed to update fee structure.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ width: "100%", minHeight: "83vh", }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        {isLoading && <Loader />}
        <Box sx={{ position: "fixed", backgroundColor: "#f2f2f2", px: 2, borderBottom: "1px solid #ddd", mb: 0.13, zIndex: "1200", width: "100%" }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Create School Fee </Typography>
            </Grid>
            <Grid
              size={{ xs: 6, sm: 6, md: 3, lg: 3 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1.5,
                borderRadius: "8px",
                px: 2,
                py: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#555",
                  whiteSpace: "nowrap",
                }}
              >
                Academic Year
              </Typography>

              <Autocomplete
                size="small"
                options={academicYears}
                value={selectedYear}
                onChange={(e, newValue) => setSelectedYear(newValue)}
                sx={{ width: 180 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 36,
                        fontSize: "14px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        backgroundColor: "#fafafa",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#ddd",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#bbb",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>
          <Box sx={{ border: "1px solid #CCC", p: 3, borderRadius: "10px" }}>
            <Typography fontWeight={600} mb={1}>
              Choose Grade
            </Typography>

            <Grid container spacing={4}>
              {grades.map((g, index) => (
                <Grid size={{ lg: 1.5 }} key={g.sign}>
                  <Tab
                    label={g.sign}
                    value={index}
                    onClick={() => {
                      setTabIndex(index);
                      setSelectedGrade(g.sign);
                    }}
                    sx={{
                      width: "100%",
                      height: "30px",
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: 13,
                      minHeight: 5,
                      borderRadius: "5px",
                      transition: "all 0.2s ease-in-out",
                      border: "1px solid rgba(0,0,0,0.1)",
                      color: selectedGrade === g.sign ? "#000" : "#444",
                      opacity: 1,
                      backgroundColor:
                        selectedGrade === g.sign
                          ? websiteSettings.mainColor
                          : "transparent",
                      boxShadow:
                        selectedGrade === g.sign
                          ? "0 1px 3px rgba(0,0,0,0.2)"
                          : "none",
                      "&:hover": {
                        backgroundColor:
                          selectedGrade === g.sign
                            ? websiteSettings.mainColor
                            : "rgba(0,0,0,0.04)",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>


            {grades.map((g, idx) => {
              const fees = gradeFees[g.sign] || [];
              return (
                tabIndex === idx && (
                  <Box key={g.sign} sx={{ position: "relative", width: "100%", mx: "auto" }}>
                    <Box sx={{ position: "absolute", left: "-33px", bottom: "39px", backgroundColor: "#F3E5F5", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", }}>
                      <IconButton
                        onClick={() => handleAddFee(g.sign)}
                        sx={{ width: "33px", height: "33px" }}
                      >
                        <AddIcon style={{ fontSize: "18px", color: "#8600BB", marginLeft: "3px" }} />
                      </IconButton>
                    </Box>
                    {fees.length > 1 && (
                      <Box sx={{ position: "absolute", right: "-33px", bottom: "39px", backgroundColor: "#F3E5F5", borderTopRightRadius: "20px", borderBottomRightRadius: "20px", }}>
                        <IconButton
                          onClick={() => handleRemoveFee(g.sign)}
                          sx={{ width: "33px", height: "33px" }}
                        >
                          <RemoveIcon style={{ fontSize: "18px", color: "#8600BB", marginRight: "3px" }} />
                        </IconButton>
                      </Box>
                    )}
                    <Box
                      sx={{
                        bgcolor: "#7B1FA2",
                        color: "#fff",
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
                      {g.sign}
                    </Box>
                    <Card
                      sx={{
                        borderRadius: "0",
                        overflow: "hidden",
                        boxShadow: "none",
                      }}
                    >
                      <Box sx={{ pb: 0 }}>
                        <Table sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                          <TableHead sx={{ bgcolor: "#f3e5f5" }}>
                            <TableRow>
                              {[
                                "Fee Details",
                                "Fee Description",
                                "Fee Amount",
                                "Due Date",
                              ].map((header, i) => (
                                <TableCell
                                  key={i}
                                  sx={{
                                    fontWeight: 600,
                                    color: "#000",
                                    fontSize: 14,
                                    py: 1.2,
                                    border: "1px dotted #ccc",
                                  }}
                                >
                                  {header}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {fees.map((fee, i) => (
                              <TableRow
                                key={i}
                                sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                              >
                                <TableCell sx={{ border: "1px dotted #ccc" }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    value={fee.feeName}
                                    onChange={(e) =>
                                      handleChange(g.sign, i, "feeName", e.target.value)
                                    }
                                    disabled={fee.mandatory}
                                    variant="outlined"
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        fontSize: 14,
                                        "& fieldset": { border: "none" },
                                        ...(fee.mandatory && {
                                          fontWeight: 600,
                                          color: "#000",
                                          "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "#000",
                                          },
                                        }),
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ border: "1px dotted #ccc", minWidth: 250 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    value={fee.desc}
                                    onChange={(e) =>
                                      handleChange(g.sign, i, "desc", e.target.value)
                                    }
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: "5px",
                                        fontSize: 14,
                                        padding: "8px",
                                      },
                                    }}
                                  />
                                </TableCell>

                                <TableCell sx={{ border: "1px dotted #ccc" }}>
                                  <TextField
                                    size="small"
                                    value={fee.amount ? Number(fee.amount).toLocaleString("en-IN") : ""}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\D/g, "");
                                      if (value.length <= 8) {
                                        handleChange(g.sign, i, "amount", value);
                                      }
                                    }}
                                    variant="outlined"
                                    slotProps={{
                                      root: {
                                        sx: {
                                          width: 150,
                                        },
                                      },
                                      input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        style: {
                                          height: 30,
                                          fontSize: 14,
                                          padding: "0 8px",
                                          WebkitAppearance: "textfield",
                                          MozAppearance: "textfield",
                                        },
                                      },
                                      maxLength: 8,
                                    }}
                                  />

                                </TableCell>
                                <TableCell sx={{ display: "flex", justifyContent: "center", alignItems: "center", border: "1px dotted #ccc" }}>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                      open={fee.openCal || false}
                                      onClose={() =>
                                        setGradeFees((prev) => {
                                          const updated = { ...prev };
                                          if (updated[g.sign][i])
                                            updated[g.sign][i].openCal = false;
                                          return updated;
                                        })
                                      }
                                      value={fee.dueDate}
                                      onChange={(newValue) =>
                                        handleDateChange(g.sign, i, newValue)
                                      }
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
                                      height: '30px',
                                      backgroundColor: '#F3E5F5',
                                      textTransform: "none",
                                      color: "#8600BB",

                                    }}
                                      onClick={() =>
                                        setGradeFees((prev) => {
                                          const updated = { ...prev };
                                          updated[g.sign][i].openCal = true;
                                          return updated;
                                        })
                                      }>
                                      {fee.dueDate ? formatDate(fee.dueDate) : "Add Due Date"}
                                      <CalendarMonthIcon style={{ color: "#8600BB", marginLeft: "10px", fontSize: '20px' }} />
                                    </Button>
                                    {fee.dueDate ? (
                                      <Tooltip title="Clear Due Date">
                                        <IconButton sx={{
                                          width: '33px',
                                          height: '33px',
                                          transition: 'color 0.3s, background-color 0.3s',
                                          '&:hover': {
                                            color: '#fff',
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                          },
                                        }} onClick={() => handleClearDate(g.sign, i)} >
                                          <HighlightOffIcon style={{ color: "red" }} />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Box sx={{ width: "33px" }}>
                                      </Box>
                                    )}
                                  </LocalizationProvider>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Card>
                    <Box display={"flex"} justifyContent={"center"}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#fff",
                          width: "55%",
                          py: 1,
                          borderBottomRightRadius: "10px",
                          borderBottomLeftRadius: "10px",
                          border: "1px solid #ccc",
                          borderTop: "none",
                          mt: 0,
                        }}
                      >
                        <Typography fontWeight={600} color="green" fontSize={15}>
                          Total Fees Amount
                        </Typography>
                        <Typography
                          fontWeight={600}
                          color="green"
                          fontSize={15}
                          sx={{ ml: 6 }}
                        >
                          Rs.{total.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              )
            })}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
        <Button
          onClick={handleResetAll}
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

        {/*  {(userType === "superadmin" || userType === "admin") && (
          <Button
            onClick={handleSubmit}
            sx={{
              backgroundColor: websiteSettings.mainColor,
              borderRadius: "30px",
              textTransform: "none",
              ml: "10px",
              // width: "180px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              px: 3,
              height: "30px",
              color: websiteSettings.textColor
            }}>
            {userType === "superadmin"
              ? `Apply for ${selectedGrade}`
              : `Request Approval`}
          </Button>
        )} */}
        {(userType === "superadmin" || userType === "admin") && (
          <Button
            onClick={hasApprovedFees ? handleUpdate : handleSubmit}
            sx={{
              backgroundColor: websiteSettings.mainColor,
              borderRadius: "30px",
              textTransform: "none",
              ml: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              px: 3,
              height: "30px",
              color: websiteSettings.textColor,
            }}
          >
            {hasApprovedFees
              ? "Update Fees"
              : userType === "superadmin"
                ? `Apply for ${selectedGrade}`
                : "Request Approval"}
          </Button>
        )}

      </Box>
    </Box>
  )
}
