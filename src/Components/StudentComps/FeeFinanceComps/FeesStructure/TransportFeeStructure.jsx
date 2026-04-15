import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Popper, Select, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NearMeIcon from '@mui/icons-material/NearMe';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import StarIcon from '@mui/icons-material/Star';
import SaveIcon from '@mui/icons-material/Save';
import RouteIcon from '@mui/icons-material/Route';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LinkIcon from '@mui/icons-material/Link';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getAllRoutes, getAllTrip, postTranspoartFee, transpoartFeeFetchByRouteId } from '../../../../Api/Api';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


export default function TransportFeeStructure() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [assignedBus, setAssignedBus] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routesData, setRoutesData] = useState([]);
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [tripDate, setTripDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeSign, setSelectedGradeSign] = useState(null);
  const [feeAmounts, setFeeAmounts] = useState({});
  const [sameFeeEnabled, setSameFeeEnabled] = useState({});
  const [tripsData, setTripsData] = useState([]);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);
  const [dueDate, setDueDate] = useState(dayjs());
  const token = "123";
  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [feeAlreadyCreated, setFeeAlreadyCreated] = useState(false);
  const [routeFeeStatus, setRouteFeeStatus] = useState({}); // { routeInformationId: true/false }

  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber;
  const userType = user.userType;

  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const isExpanded = useSelector((state) => state.sidebar.isExpanded);

  const selectSx = {
    height: 57,
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#1976d2",
    },
    "&.Mui-focused": {
      borderColor: "#1976d2",
      boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
    }
  };

  const labelSx = {
    color: "#333",
    fontWeight: 600,
    fontSize: "13px",
    mb: 0.75,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    "& .required": {
      color: "#d32f2f",
      marginLeft: "2px"
    }
  };

  const handleFeeAmountChange = (stopId, gradeId, value) => {
    if (value === '' || /^\d+$/.test(value)) {
      if (sameFeeEnabled[stopId]) { 
        const updates = {};
        grades.forEach(grade => {
          updates[`${stopId}_${grade.id}`] = value;
        });
        setFeeAmounts(prev => ({
          ...prev,
          ...updates
        }));
      } else {
        setFeeAmounts(prev => ({
          ...prev,
          [`${stopId}_${gradeId}`]: value
        }));
      }
    }
  };

  const handleSameFeeToggle = (stopId) => {
    setSameFeeEnabled(prev => ({
      ...prev,
      [stopId]: !prev[stopId]
    }));
  };

  const handleSelectRoute = (routeId) => {
    setSelectedRoute(routeId);
    setOpenRouteDialog(false);

    const route = routesData.find(r => r.routeInformationId === routeId);
    if (route && route.tripName) {
      fetchTrip(route.tripName);
    }
  };

  const convertGradeSignToApiKey = (gradeSign) => {
    if (!gradeSign) return '';

    const normalized = gradeSign.replace(/[-\s]/g, '').toLowerCase();

    if (normalized === 'prekg') return 'prekg';
    if (normalized === 'lkg') return 'lkg';
    if (normalized === 'ukg') return 'ukg';

    return normalized;
  };

  const findGradeIdByApiKey = (apiKey) => {
    const grade = grades.find(g => {
      const gradeApiKey = convertGradeSignToApiKey(g.sign);
      return gradeApiKey === apiKey.toLowerCase();
    });
    return grade ? grade.id : null;
  };

  const fetchExistingTripFee = async (tripDetails) => {
    if (!tripDetails?.routeInformation?.id) return;

    try {
      const response = await axios.get(transpoartFeeFetchByRouteId, {
        params: {
          RouteInformationId: tripDetails.routeInformation.id,
          Year: selectedYear,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      if (data?.success && data.routeStopsFees && data.routeStopsFees.length > 0) {
        const feeAmountsMap = {};

        data.routeStopsFees.forEach((stop) => {
          if (stop.grades) {
            Object.entries(stop.grades).forEach(([gradeKey, amount]) => {
              const gradeId = findGradeIdByApiKey(gradeKey);
              if (gradeId && amount !== null && amount !== undefined) {
                feeAmountsMap[`${stop.routeStopsId}_${gradeId}`] = String(amount);
              }
            });
          }
        });

        setFeeAmounts(feeAmountsMap);
        setFeeAlreadyCreated(true);
      } else {
        setFeeAlreadyCreated(false);
      }
    } catch {
      setFeeAlreadyCreated(false);
    }
  };

  const handleResetAll = () => {
    setFeeAmounts({});
    setSameFeeEnabled({});
    setMessage('All fee amounts have been reset');
    setColor('info');
    setStatus(true);
    setOpen(true);
  };

  const handleApply = async () => {
    if (!selectedTripDetails) {
      setMessage('Please select a trip first');
      setColor('error');
      setStatus(true);
      setOpen(true);
      return;
    }

    if (!dueDate) {
      setMessage('Please select a due date');
      setColor('error');
      setStatus(true);
      setOpen(true);
      return;
    }

    const hasAnyFee = Object.values(feeAmounts).some(amount => amount && amount > 0);
    if (!hasAnyFee) {
      setMessage('Please enter at least one fee amount');
      setColor('error');
      setStatus(true);
      setOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const routes = [];

      selectedTripDetails.routeStops.forEach(stop => {
        const gradeFees = {};
        let hasFeesForThisStop = false;

        grades.forEach(grade => {
          const feeKey = `${stop.id}_${grade.id}`;
          const feeAmount = feeAmounts[feeKey];

          if (feeAmount && feeAmount > 0) {
            const apiKey = convertGradeSignToApiKey(grade.sign);
            gradeFees[apiKey] = parseInt(feeAmount);
            hasFeesForThisStop = true;
          }
        });

        if (hasFeesForThisStop) {
          routes.push({
            routeStopsId: stop.id,
            ...gradeFees,
            dueDate: dayjs(dueDate).format('YYYY-MM-DDTHH:mm:ss')
          });
        }
      });

      if (routes.length === 0) {
        setMessage('No fee amounts to save');
        setColor('warning');
        setStatus(true);
        setOpen(true);
        setIsLoading(false);
        return;
      }

      const payload = {
        rollNumber: rollNumber,
        year: selectedYear,
        routeInformationId: selectedTripDetails.routeInformation.id,
        routes: routes
      };

      const response = await axios.post(postTranspoartFee, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage("Transport fee structure saved successfully");
      setColor('success');
      setStatus(true);
      setOpen(true);

    } catch (error) {
      console.error("Error saving transport fee:", error);
      setMessage(error.response?.data?.message || 'Failed to save transport fee structure');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute && routesData.length > 0) {
      const route = routesData.find(r => r.routeInformationId === selectedRoute);
      if (route && route.tripName) {
        fetchTrip(route.tripName);
      }
    }
  }, [selectedRoute, routesData]);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(getAllRoutes, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.routes) {
        setRoutesData(response.data.routes);
        checkAllRoutesFeeStatus(response.data.routes);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setMessage('Failed to load routes');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllRoutesFeeStatus = async (routes) => {
    const statusMap = {};
    await Promise.all(
      routes.map(async (route) => {
        try {
          const res = await axios.get(transpoartFeeFetchByRouteId, {
            params: { RouteInformationId: route.routeInformationId, Year: selectedYear },
            headers: { Authorization: `Bearer ${token}` },
          });
          statusMap[route.routeInformationId] = !!(res.data?.success && res.data.routeStopsFees?.length > 0);
        } catch {
          statusMap[route.routeInformationId] = false;
        }
      })
    );
    setRouteFeeStatus(statusMap);
  };

  const fetchTrip = async (tripName) => {
    if (!tripName) return;

    setIsLoading(true);
    try {
      const response = await axios.get(getAllTrip, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          tripName: tripName
        }
      });

      if (response.data && response.data.trips && response.data.trips.length > 0) {
        const tripDetails = response.data.trips[0];
        setTripsData(response.data.trips);
        setSelectedTripDetails(tripDetails);
        setFeeAlreadyCreated(false);
        setFeeAmounts({});
        setSameFeeEnabled({});
        fetchExistingTripFee(tripDetails);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setMessage('Failed to load trip details');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ width: "100%", bgcolor: "#fafafa" }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        {isLoading && <Loader />}

        {/* Fixed Header */}
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
          overflow: "hidden",
          py: 0.7
        }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "32px", height: "32px", mr: 1 }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#333" }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: "18px", color: "#333" }}>
                Create Transport Fee Structure
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1.5, mt: { xs: 1, md: 0 } }}>
              <Button
                startIcon={<VisibilityIcon />}
                onClick={() => navigate('created-fees')}
                sx={{
                  background: "none",
                  color: "#000",
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  height: 30,
                  borderRadius: "30px",
                  border: "1px solid #000",
                  px: 3,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#e8e8e8" }
                }}
              >
                Created Fees
              </Button>
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
                        fontWeight: 600
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>

          {/* Filter Dropdowns */}
          <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", bgcolor: "#fff", p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
                <InputLabel sx={labelSx}>
                  <RouteIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                  Trip Name <span className="required">*</span>
                  <Tooltip title="View all available trips" placement="top" arrow>
                    <IconButton
                      size="small"
                      onClick={() => setOpenRouteDialog(true)}
                      sx={{
                        ml: 0.5,
                        width: 24,
                        height: 24,
                        bgcolor: "#E3F2FD",
                        color: "#1976d2",
                        border: "1px solid #BBDEFB",
                        "&:hover": {
                          bgcolor: "#1976d2",
                          color: "#fff",
                          borderColor: "#1976d2",
                        },
                      }}
                    >
                      <InfoIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </InputLabel>
                <Select
                  fullWidth
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  displayEmpty
                  sx={selectSx}
                  renderValue={(value) => {
                    if (!value) return <Typography color="#999" fontSize="14px">Select a trip</Typography>;
                    const route = routesData.find(r => r.routeInformationId === value);
                    if (!route) return value;
                    const hasFee = routeFeeStatus[route.routeInformationId];
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <RouteIcon sx={{ fontSize: 18, color: hasFee ? "#16A34A" : "#1976d2" }} />
                        <Typography fontSize="14px" fontWeight="600">{route.tripName}</Typography>
                        {hasFee && <CheckCircleIcon sx={{ fontSize: 16, color: "#16A34A", ml: 0.5 }} />}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography color="#999" fontSize="14px">Select a trip</Typography>
                  </MenuItem>
                  {routesData.map((route) => {
                    const hasFee = routeFeeStatus[route.routeInformationId];
                    return (
                      <MenuItem key={route.routeInformationId} value={route.routeInformationId}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <RouteIcon sx={{ fontSize: 18, color: hasFee ? "#16A34A" : "#1976d2" }} />
                            <Box>
                              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                                {route.tripName}
                              </Typography>
                              <Typography sx={{ fontSize: "11px", color: "#666" }}>
                                {route.assignBus} • {route.tripSlot} • {route.time}
                              </Typography>
                            </Box>
                          </Box>
                          {hasFee && (
                            <Chip
                              label="Fee Created"
                              size="small"
                              icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "#16A34A !important" }} />}
                              sx={{
                                fontSize: 10, fontWeight: 700, height: 22, ml: 1,
                                bgcolor: "#F0FDF4", color: "#16A34A",
                                border: "1px solid #A7F3D0",
                              }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
                <InputLabel sx={{
                  color: "#333",
                  fontWeight: 600,
                  fontSize: "13px",
                  mb: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "& .required": {
                    color: "#d32f2f",
                    marginLeft: "2px"
                  }
                }}>

                  <CalendarMonthIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                  Due Date <span className="required">*</span>
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={dueDate}
                    onChange={(newValue) => setDueDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {

                            borderRadius: "5px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1976d2",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1976d2",
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            fontSize: "14px",
                            padding: "10px 14px",
                          },
                        }
                      }
                    }}
                    format="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>

          {/* Bus Route Info Table */}
          {selectedTripDetails && (
            <>
              <Box
                sx={{
                  bgcolor: "#1976d2",
                  color: "#fff",
                  fontSize: "13px",
                  px: 3,
                  py: 0.75,
                  fontWeight: 600,
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  width: "fit-content",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <DirectionsBusIcon sx={{ fontSize: 16 }} />
                {selectedTripDetails.routeInformation.assignBus}
              </Box>

              <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", borderTopLeftRadius: 0, mb: 2, bgcolor: "#fff" }}>
                <TableContainer>
                  <Table sx={{ minWidth: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 600, fontSize: "13px", color: "#555", py: 1.5, textAlign: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                            <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Trip Name
                          </Box>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 600, fontSize: "13px", color: "#555", textAlign: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                            <SyncAltIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Trip Type
                          </Box>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 600, fontSize: "13px", color: "#555", textAlign: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Trip Slot
                          </Box>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 600, fontSize: "13px", color: "#555", textAlign: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Duration
                          </Box>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#faf6fc", fontWeight: 600, fontSize: "13px", color: "#555", textAlign: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                            <FmdGoodIcon sx={{ fontSize: 16, color: "#00796b" }} />
                            No. of Bus Stops
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontSize: "14px", color: "#333", textAlign: "center", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                            {selectedTripDetails.routeInformation.tripName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#333", textAlign: "center", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Chip
                            label={selectedTripDetails.routeInformation.tripType.charAt(0).toUpperCase() + selectedTripDetails.routeInformation.tripType.slice(1)}
                            size="small"
                            icon={
                              selectedTripDetails.routeInformation.tripType.toLowerCase() === 'pickup' ? (
                                <AirportShuttleIcon sx={{ fontSize: 14 }} />
                              ) : selectedTripDetails.routeInformation.tripType.toLowerCase() === 'drop' ? (
                                <HomeIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <SyncAltIcon sx={{ fontSize: 14 }} />
                              )
                            }
                            sx={{
                              bgcolor:
                                selectedTripDetails.routeInformation.tripType.toLowerCase() === 'pickup' ? "#E3F2FD" :
                                  selectedTripDetails.routeInformation.tripType.toLowerCase() === 'drop' ? "#FFF3E0" :
                                    "#F3E5F5",
                              color:
                                selectedTripDetails.routeInformation.tripType.toLowerCase() === 'pickup' ? "#1565C0" :
                                  selectedTripDetails.routeInformation.tripType.toLowerCase() === 'drop' ? "#E65100" :
                                    "#6A1B9A",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#333", textAlign: "center", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                            {selectedTripDetails.routeInformation.tripSlot.toLowerCase() === 'morning' && (
                              <WbTwilightIcon sx={{ fontSize: 16, color: "#F97316" }} />
                            )}
                            {selectedTripDetails.routeInformation.tripSlot.toLowerCase() === 'afternoon' && (
                              <WbSunnyIcon sx={{ fontSize: 16, color: "#EAB308" }} />
                            )}
                            {selectedTripDetails.routeInformation.tripSlot.toLowerCase() === 'evening' && (
                              <NightsStayIcon sx={{ fontSize: 16, color: "#6366F1" }} />
                            )}
                            {selectedTripDetails.routeInformation.tripSlot.toLowerCase() === 'everyday' && (
                              <StarIcon sx={{ fontSize: 16, color: "#EC4899" }} />
                            )}
                            {selectedTripDetails.routeInformation.tripSlot.charAt(0).toUpperCase() + selectedTripDetails.routeInformation.tripSlot.slice(1)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#333", textAlign: "center", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                            {selectedTripDetails.routeInformation.durationTime}
                          </Typography>
                          <Typography sx={{ fontSize: "12px", color: "#666" }}>
                            {selectedTripDetails.routeInformation.durationMin}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#333", textAlign: "center" }}>
                          <Chip
                            label={selectedTripDetails.routeStops.length}
                            size="small"
                            sx={{
                              bgcolor: "#E8F5E9",
                              color: "#2E7D32",
                              fontWeight: 700,
                              fontSize: "13px",
                              minWidth: "36px"
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {/* No Trip Selected Empty State */}
          {!selectedRoute && (
            <Box sx={{
              bgcolor: "#fff",
              border: "1px solid #E8DDEA",
              borderRadius: "5px",
              p: 5,
              mb: 2,
              textAlign: "center"
            }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#E3F2FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <DirectionsBusIcon sx={{ fontSize: 32, color: "#1976d2" }} />
              </Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#333", mb: 1 }}>
                No Trip Selected
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                Please select a trip from the dropdown above
              </Typography>
            </Box>
          )}

          {/* Fee Already Created Banner */}
          {selectedTripDetails && feeAlreadyCreated && (
            <Box sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "#F0FDF4",
              border: "1px solid #86EFAC",
              borderRadius: "5px",
              px: 2.5,
              py: 1.25,
              mb: 2,
            }}>
              <LockIcon sx={{ fontSize: 18, color: "#16A34A" }} />
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#15803D" }}>
                  Fee Structure Already Created
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#166534" }}>
                  Fees are already set for this trip. Go to "Created Fees" to edit or manage them.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('created-fees')}
                sx={{
                  ml: "auto",
                  textTransform: "none",
                  fontSize: "12px",
                  borderRadius: "30px",
                  color: "#16A34A",
                  borderColor: "#16A34A",
                  "&:hover": { bgcolor: "#DCFCE7", borderColor: "#15803D" }
                }}
              >
                View Created Fees
              </Button>
            </Box>
          )}

          {/* Bus Stops & Fee Structure */}
          {selectedTripDetails && (
            <>
              <Box
                sx={{
                  bgcolor: "#00796b",
                  color: "#fff",
                  fontSize: "13px",
                  px: 3,
                  py: 0.75,
                  fontWeight: 600,
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  width: "fit-content",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <FmdGoodIcon sx={{ fontSize: 16 }} />
                Bus Stops & Fee Structure
              </Box>

              <Box sx={{
                bgcolor: "#fff",
                border: "1px solid #E8DDEA",
                borderRadius: "5px",
                borderTopLeftRadius: 0
              }}>
                {selectedTripDetails.routeStops.map((stop, index) => (
                  <Box
                    key={stop.id}
                    sx={{
                      borderBottom: index !== selectedTripDetails.routeStops.length - 1 ? "1px solid #E8DDEA" : "none",
                    }}
                  >
                    {/* Stop Header */}
                    <Box
                      sx={{
                        bgcolor: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #E8DDEA",
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#1976d2",
                            color: "#fff",
                            minWidth: 26,
                            height: 26,
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 600
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                          {stop.point === "Starting Point" ? (
                            <PlayArrowIcon sx={{ fontSize: 16, color: "#2E7D32" }} />
                          ) : stop.point === "Final Destination" ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: "#D32F2F" }} />
                          ) : (
                            <FmdGoodIcon sx={{ fontSize: 16, color: "#00796b" }} />
                          )}
                          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                            {stop.point} - {stop.place}
                          </Typography>
                          {(stop.point === "Starting Point" || stop.point === "Final Destination") && (
                            <Chip
                              label={stop.point === "Starting Point" ? "Start" : "End"}
                              size="small"
                              sx={{
                                bgcolor: stop.point === "Starting Point" ? "#E8F5E9" : "#FFEBEE",
                                color: stop.point === "Starting Point" ? "#2E7D32" : "#D32F2F",
                                fontSize: "10px",
                                fontWeight: 700,
                                height: "20px"
                              }}
                            />
                          )}
                          <Chip
                            label={stop.arrivalTime}
                            size="small"
                            icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
                            sx={{
                              bgcolor: "#E3F2FD",
                              color: "#1565C0",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Same Fee Toggle */}
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 0.5,
                        bgcolor: sameFeeEnabled[stop.id] ? "#E0F2FE" : "transparent",
                        borderRadius: "4px",
                        border: sameFeeEnabled[stop.id] ? "1px solid #0284C7" : "1px solid transparent",
                      }}>
                        <LinkIcon sx={{
                          fontSize: 16,
                          color: sameFeeEnabled[stop.id] ? "#0284C7" : "#999"
                        }} />
                        <Typography sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: sameFeeEnabled[stop.id] ? "#0284C7" : "#666"
                        }}>
                          Same Fee for All Classes
                        </Typography>
                        <Switch
                          size="small"
                          disabled={feeAlreadyCreated}
                          checked={sameFeeEnabled[stop.id] || false}
                          onChange={() => handleSameFeeToggle(stop.id)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#00796b',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#00796b',
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Fee Grid */}
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={1.5}>
                        {grades.map((grade) => (
                          <Grid
                            key={grade.id}
                            size={{
                              xs: 6,
                              sm: 4,
                              md: 3,
                              lg: 2
                            }}
                          >
                            <Box
                              sx={{
                                border: "1px solid #E8DDEA",
                                borderRadius: "5px",
                                p: 1.5,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "#666",
                                  mb: 0.75
                                }}
                              >
                                {grade.sign}
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Amount"
                                disabled={feeAlreadyCreated}
                                value={feeAmounts[`${stop.id}_${grade.id}`] || ''}
                                onChange={(e) => handleFeeAmountChange(stop.id, grade.id, e.target.value)}
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Typography sx={{ fontSize: "13px", color: "#00796b", fontWeight: 600 }}>
                                          ₹
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                  }
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    fontSize: "14px",
                                    bgcolor: "#fafafa",
                                    borderRadius: "4px",
                                    "& fieldset": {
                                      borderColor: "#E8DDEA"
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "#bdbdbd"
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#1976d2",
                                      borderWidth: "1px"
                                    }
                                  },
                                  "& input": {
                                    padding: "8px 10px",
                                    color: "#333",
                                    fontWeight: 500
                                  },
                                  "& .MuiInputBase-input.Mui-disabled": {
                                    WebkitTextFillColor: "#000",
                                  }
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* Action Buttons */}
          {selectedTripDetails && (
            <Box sx={{
              display: "flex",
              gap: 2,
              mt: 2.5,
              justifyContent: {
                xs: "center",
                sm: "flex-end"
              }
            }}>
              <Button
                disabled={feeAlreadyCreated}
                onClick={handleResetAll}
                sx={{
                  border: "1px solid #000",
                  borderRadius: "30px",
                  textTransform: "none",
                  width: "120px",
                  height: "35px",
                  color: "#000",
                  fontSize: "13px",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#f5f5f5"
                  },
                  "&.Mui-disabled": {
                    border: "1px solid #ccc",
                    color: "#aaa"
                  }
                }}
              >
                Reset All
              </Button>
              <Tooltip
                title={feeAlreadyCreated ? "Fee structure already created for this trip. Go to 'Created Fees' to edit." : ""}
                placement="top"
                arrow
              >
                <span>
                  <Button
                    variant="contained"
                    disabled={feeAlreadyCreated}
                    onClick={handleApply}
                    sx={{
                      backgroundColor: websiteSettings.mainColor,
                      borderRadius: "30px",
                      textTransform: "none",
                      boxShadow: "none",
                      border: "1px solid rgba(0,0,0,0.1)",
                      px: 3,
                      height: "35px",
                      color: websiteSettings.textColor,
                      fontSize: "13px",
                      fontWeight: 600,
                      "&:hover": {
                        boxShadow: "none",
                        opacity: 0.9,
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#e0e0e0",
                        color: "#aaa",
                        boxShadow: "none"
                      }
                    }}
                  >
                    {userType === "superadmin" ? "Apply" : "Send for Approval"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Route Selection Dialog */}
        <Dialog
          open={openRouteDialog}
          onClose={() => setOpenRouteDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "5px",
              maxHeight: "90vh",
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: "#1976D2",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.5,
            px: 2.5,
            borderBottom: "1px solid #ddd",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <RouteIcon sx={{ fontSize: 22, color: "#fff" }} />
              <Box>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  Select Trip Route
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#fff", mt: 0.25 }}>
                  {routesData.length} trips available
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setOpenRouteDialog(false)}
              sx={{ color: "#fff" }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {routesData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <InfoIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
                <Typography sx={{ fontSize: "16px", color: "#666", mb: 0.5 }}>
                  No trips available
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#999" }}>
                  Please create a route first to set up transport fees
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: "60vh" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                          <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Trip Name
                        </Box>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                          <DirectionsBusIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Assigned Bus
                        </Box>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                          <SyncAltIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Trip Type
                        </Box>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Trip Slot
                        </Box>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Time & Duration
                        </Box>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Status
                        </Box>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#faf6fc", fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routesData.map((route, index) => (
                      <TableRow
                        key={route.routeInformationId}
                        sx={{
                          "&:hover": { bgcolor: "#F5F9FF" },
                          bgcolor: selectedRoute === route.routeInformationId ? "#E3F2FD" : "transparent",
                        }}
                      >
                        <TableCell sx={{ fontSize: "14px", fontWeight: 600, color: "#333", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                minWidth: 26,
                                height: 26,
                                borderRadius: "4px",
                                bgcolor: selectedRoute === route.routeInformationId ? "#1976d2" : "#E0E0E0",
                                color: selectedRoute === route.routeInformationId ? "#fff" : "#666",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              {index + 1}
                            </Box>
                            {route.tripName}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <DirectionsBusIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            {route.assignBus}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555", borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                          <Chip
                            label={route.tripType}
                            size="small"
                            icon={
                              route.tripType.toLowerCase() === 'pickup' ? (
                                <AirportShuttleIcon sx={{ fontSize: 14 }} />
                              ) : route.tripType.toLowerCase() === 'drop' ? (
                                <HomeIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <SyncAltIcon sx={{ fontSize: 14 }} />
                              )
                            }
                            sx={{
                              bgcolor:
                                route.tripType.toLowerCase() === 'pickup' ? "#E3F2FD" :
                                  route.tripType.toLowerCase() === 'drop' ? "#FFF3E0" :
                                    "#F3E5F5",
                              color:
                                route.tripType.toLowerCase() === 'pickup' ? "#1565C0" :
                                  route.tripType.toLowerCase() === 'drop' ? "#E65100" :
                                    "#6A1B9A",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            {route.tripSlot.toLowerCase() === 'morning' && (
                              <WbTwilightIcon sx={{ fontSize: 16, color: "#F97316" }} />
                            )}
                            {route.tripSlot.toLowerCase() === 'afternoon' && (
                              <WbSunnyIcon sx={{ fontSize: 16, color: "#EAB308" }} />
                            )}
                            {route.tripSlot.toLowerCase() === 'evening' && (
                              <NightsStayIcon sx={{ fontSize: 16, color: "#6366F1" }} />
                            )}
                            {route.tripSlot.toLowerCase() === 'everyday' && (
                              <StarIcon sx={{ fontSize: 16, color: "#EC4899" }} />
                            )}
                            {route.tripSlot}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "13px", color: "#555", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                            {route.time}
                          </Typography>
                          <Typography sx={{ fontSize: "12px", color: "#999", mt: 0.25 }}>
                            {route.duration}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", borderRight: 1, borderColor: "#E8DDEA" }}>
                          <Chip
                            label={route.active}
                            size="small"
                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: route.active.toLowerCase() === 'active' ? "#E8F5E9" : "#FFEBEE",
                              color: route.active.toLowerCase() === 'active' ? "#2E7D32" : "#C62828",
                              fontWeight: 600,
                              fontSize: "11px",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Button
                            variant={selectedRoute === route.routeInformationId ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleSelectRoute(route.routeInformationId)}
                            sx={{
                              textTransform: "none",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "30px",
                              px: 2,
                              ...(selectedRoute === route.routeInformationId ? {
                                bgcolor: "#1976d2",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#1565c0", boxShadow: "none" }
                              } : {
                                borderColor: "#1976d2",
                                color: "#1976d2",
                                "&:hover": {
                                  borderColor: "#1565c0",
                                  bgcolor: "#E3F2FD",
                                }
                              })
                            }}
                          >
                            {selectedRoute === route.routeInformationId ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  )
}
