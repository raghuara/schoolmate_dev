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
import { getAllRoutes, getAllTrip, postTranspoartFee } from '../../../../Api/Api';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


const buses = [
  { id: 1, name: "Bus A", number: "TN-45-AB-1234" },
  { id: 2, name: "Bus B", number: "TN-45-CD-5678" },
  { id: 3, name: "Bus C", number: "TN-45-EF-9012" },
];

const TripSlot = [
  { value: "Morning", label: "Morning", icon: <WbTwilightIcon sx={{ fontSize: 16, color: "#F97316" }} /> },
  { value: "Afternoon", label: "Afternoon", icon: <WbSunnyIcon sx={{ fontSize: 16, color: "#EAB308" }} /> },
  { value: "Evening", label: "Evening", icon: <NightsStayIcon sx={{ fontSize: 16, color: "#6366F1" }} /> },
  { value: "Special", label: "Special", icon: <StarIcon sx={{ fontSize: 16, color: "#EC4899" }} /> }
];

const tripTypes = [
  { value: "Pickup", label: "Pickup", icon: <AirportShuttleIcon sx={{ fontSize: 16, color: "#3B82F6" }} /> },
  { value: "Drop", label: "Drop", icon: <HomeIcon sx={{ fontSize: 16, color: "#F59E0B" }} /> },
  { value: "Round Trip", label: "Round Trip", icon: <SyncAltIcon sx={{ fontSize: 16, color: "#8B5CF6" }} /> }
];


export default function TransportFeeStructure() {
  const navigate = useNavigate()
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
    height: 44,
    borderRadius: "4px",
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
        // If same fee is enabled for this stop, update all grades with the same value
        const updates = {};
        grades.forEach(grade => {
          updates[`${stopId}_${grade.id}`] = value;
        });
        setFeeAmounts(prev => ({
          ...prev,
          ...updates
        }));
      } else {
        // Normal update for single grade
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

    // Find the selected route and get its tripName
    const route = routesData.find(r => r.routeInformationId === routeId);
    if (route && route.tripName) {
      fetchTrip(route.tripName);
    }
  };

  // Utility function to convert grade sign to API key format
  const convertGradeSignToApiKey = (gradeSign) => {
    if (!gradeSign) return '';

    // Remove spaces and hyphens, convert to lowercase
    const normalized = gradeSign.replace(/[-\s]/g, '').toLowerCase();

    // Handle special cases
    if (normalized === 'prekg') return 'prekg';
    if (normalized === 'lkg') return 'lkg';
    if (normalized === 'ukg') return 'ukg';

    // For Roman numerals (I, II, III, etc.), just convert to lowercase
    return normalized;
  };

  // Handle Reset All
  const handleResetAll = () => {
    setFeeAmounts({});
    setSameFeeEnabled({});
    setMessage('All fee amounts have been reset');
    setColor('info');
    setStatus(true);
    setOpen(true);
  };

  // Handle Apply - Post transport fee structure
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

    // Check if at least one fee amount is entered
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
      // Create routes array to hold all stops data
      const routes = [];

      // Iterate through each route stop
      selectedTripDetails.routeStops.forEach(stop => {
        // Build the grade fees object dynamically
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

      // Optionally reset the form
      // setFeeAmounts({});
      // setSameFeeEnabled({});

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
        setTripsData(response.data.trips);
        // Set the first trip as selected (since we're fetching by tripName, it should be the specific trip)
        setSelectedTripDetails(response.data.trips[0]);
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

        {/* Header */}
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
              <IconButton onClick={() => navigate(-1)} sx={{
                width: "32px",
                height: "32px",
                mr: 1,
                "&:hover": { bgcolor: "#f5f5f5" }
              }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#333" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "18px", color: "#333" }}>
                Create Transport Fee Structure
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, mt: { xs: 1, md: 0 } }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, pr: { md: 1 } }}>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate('created-fees')}
                    sx={{
                      background: "#000",
                      color: "#fff",
                      textTransform: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      width: "200px",
                      height: 36,
                      borderRadius: "30px",
                      px: 3,
                      boxShadow: "none"
                    }}
                  >
                    Created Fees
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                  <Box sx={{ minWidth: 140 }}>
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
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>

          {/* Filter Dropdowns */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
              <InputLabel sx={labelSx}>
                <RouteIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                Trip Name <span className="required">*</span>
                <Tooltip title="View all available trips" placement="top" arrow>
                  <IconButton
                    size="small"
                    onClick={() => setOpenRouteDialog(true)}
                    sx={{
                      ml: 0.75,
                      width: 26,
                      height: 26,
                      bgcolor: "#E3F2FD",
                      color: "#1976d2",
                      border: "1px solid #BBDEFB",
                      boxShadow: "0 1px 2px rgba(25, 118, 210, 0.15)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#1976d2",
                        color: "#fff",
                        borderColor: "#1976d2",
                        boxShadow: "0 2px 4px rgba(25, 118, 210, 0.3)",
                        transform: "scale(1.08)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </InputLabel>
              <Select
                fullWidth
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                displayEmpty
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <Typography color="#999">Select a trip</Typography>
                </MenuItem>
                {routesData.map((route) => (
                  <MenuItem key={route.routeInformationId} value={route.routeInformationId}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <RouteIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                      <Box>
                        <Typography fontSize="14px" fontWeight="600">
                          {route.tripName}
                        </Typography>
                        <Typography fontSize="11px" color="#666">
                          {route.assignBus} • {route.tripSlot} • {route.time}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
              <InputLabel sx={labelSx}>
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
                          height: 44,
                          borderRadius: "4px",
                          fontSize: "14px",
                          backgroundColor: "#fff",
                          transition: "all 0.2s ease",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1976d2",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1976d2",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
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

          {/* Bus Route Info */}
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
                  borderTopLeftRadius: "4px",
                  borderTopRightRadius: "4px",
                  width: "fit-content",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <DirectionsBusIcon sx={{ fontSize: 16 }} />
                {selectedTripDetails.routeInformation.assignBus}
              </Box>

              <Box sx={{ backgroundColor: "#fff", border: "1px solid rgb(199, 210, 254)", borderRadius: "4px", borderTopLeftRadius: 0, mb: 2 }}>
                <TableContainer>
                  <Table sx={{ minWidth: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#EEF2FF" }}>
                        <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555", py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Trip Name
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <SyncAltIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Trip Type
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Trip Slot
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            Duration
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <FmdGoodIcon sx={{ fontSize: 16, color: "#00796b" }} />
                            No. of Bus Stops
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                        <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1, fontWeight: 600 }}>
                            {selectedTripDetails.routeInformation.tripName}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#333" }}>
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
                        <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
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
                        <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                          <Box sx={{ pl: 1 }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                              {selectedTripDetails.routeInformation.durationTime}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#666" }}>
                              {selectedTripDetails.routeInformation.durationMin}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
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
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {!selectedRoute && (
            <Box sx={{
              bgcolor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
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

              <Typography sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#333",
                mb: 1
              }}>
                No Trip Selected
              </Typography>

              <Typography sx={{
                fontSize: "14px",
                color: "#666",
                lineHeight: 1.5
              }}>
                Please select a trip from the dropdown above
              </Typography>
            </Box>
          )}

          {/* Bus Stops Fee Structure */}
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
                  borderTopLeftRadius: "4px",
                  borderTopRightRadius: "4px",
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
                border: "1px solid rgb(167, 243, 208)",
                borderRadius: "4px",
                borderTopLeftRadius: 0
              }}>
                {/* Bus stops data from API */}
                {selectedTripDetails.routeStops.map((stop, index) => (
                  <Box
                    key={stop.id}
                    sx={{
                      borderBottom: index !== selectedTripDetails.routeStops.length - 1 ? "1px solid #e0e0e0" : "none",

                    }}
                  >
                    {/* Stop Header */}
                    <Box
                      sx={{
                        bgcolor: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgb(167, 243, 208)",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#ECFDF5",
                          px: 2.5,
                          py: 1.25,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,


                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#1976d2",
                            color: "#fff",
                            minWidth: 28,
                            height: 28,
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
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
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2.5,
                        py: 0.5,
                        bgcolor: sameFeeEnabled[stop.id] ? "#E0F2FE" : "transparent",
                        borderRadius: "4px",
                        border: sameFeeEnabled[stop.id] ? "1px solid #0284C7" : "1px solid transparent",
                        transition: "all 0.2s"
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
                    <Box sx={{ p: 2.5 }}>
                      <Grid container spacing={2}>
                        {grades.map((grade) => (
                          <Grid
                            key={grade.id}
                            size={{
                              xs: 12,
                              sm: 6,
                              md: 4,
                              lg: 2
                            }}
                          >
                            <Box
                              sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                p: 1.5,
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: "#00796B",
                                  boxShadow: "0 2px 4px rgba(25, 118, 210, 0.1)"
                                }
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
                                      borderColor: "#e0e0e0"
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
                onClick={handleResetAll}
                startIcon={<CloseIcon />}
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
                  }
                }}>
                Reset All
              </Button>
              <Button
                variant="contained"
                onClick={handleApply}
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: websiteSettings.mainColor,
                  borderRadius: "30px",
                  textTransform: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  px: 3,
                  height: "35px",
                  color: websiteSettings.textColor,
                  fontSize: "13px",
                  fontWeight: 600,
                  "&:hover": {
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }
                }}
              >
                Save Fee Structure
              </Button>
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
              borderRadius: "12px",
              maxHeight: "90vh",
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: "#1976d2",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <RouteIcon sx={{ fontSize: 24 }} />
              <Box>
                <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                  Select Trip Route
                </Typography>
                <Typography sx={{ fontSize: "12px", opacity: 0.9, mt: 0.5 }}>
                  {routesData.length} trips available • Choose the correct trip for fee structure
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setOpenRouteDialog(false)}
              sx={{
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {routesData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <InfoIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                <Typography sx={{ fontSize: "16px", color: "#666", mb: 1 }}>
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
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Trip Name
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <DirectionsBusIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Assigned Bus
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <SyncAltIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Trip Type
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Trip Slot
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Time & Duration
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          Status
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        bgcolor: "#F5F5F5",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#333",
                        borderBottom: "2px solid #1976d2",
                        textAlign: "center",
                      }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routesData.map((route, index) => (
                      <TableRow
                        key={route.routeInformationId}
                        sx={{
                          "&:hover": {
                            bgcolor: "#F5F9FF",
                          },
                          bgcolor: selectedRoute === route.routeInformationId ? "#E3F2FD" : "transparent",
                          transition: "all 0.2s",
                        }}
                      >
                        <TableCell sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                minWidth: 28,
                                height: 28,
                                borderRadius: "6px",
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
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <DirectionsBusIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            {route.assignBus}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
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
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
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
                        <TableCell sx={{ fontSize: "13px", color: "#555" }}>
                          <Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                              {route.time}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#999", mt: 0.25 }}>
                              {route.duration}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
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
                              borderRadius: "6px",
                              px: 2,
                              ...(selectedRoute === route.routeInformationId ? {
                                bgcolor: "#1976d2",
                                "&:hover": { bgcolor: "#1565c0" }
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

          <Divider />

          <DialogActions sx={{ px: 3, py: 2, bgcolor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Typography sx={{ fontSize: "13px", color: "#666" }}>
                {selectedRoute
                  ? `Selected: ${routesData.find(r => r.routeInformationId === selectedRoute)?.tripName || ''}`
                  : 'No trip selected'}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  onClick={() => setOpenRouteDialog(false)}
                  sx={{
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    "&:hover": { bgcolor: "#F5F5F5" }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setOpenRouteDialog(false)}
                  disabled={!selectedRoute}
                  sx={{
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    bgcolor: "#1976d2",
                    px: 3,
                    "&:hover": { bgcolor: "#1565c0" },
                    "&:disabled": {
                      bgcolor: "#E0E0E0",
                      color: "#999"
                    }
                  }}
                >
                  Confirm Selection
                </Button>
              </Box>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
