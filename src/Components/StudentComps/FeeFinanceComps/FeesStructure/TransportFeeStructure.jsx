import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Popper, Select, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
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
  const [tripDate, setTripDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeSign, setSelectedGradeSign] = useState(null);
  const [feeAmounts, setFeeAmounts] = useState({});
  const [sameFeeEnabled, setSameFeeEnabled] = useState({});

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
          </Grid>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>

          {/* Filter Dropdowns */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
              <InputLabel sx={labelSx}>
                <DirectionsBusIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                Bus <span className="required">*</span>
              </InputLabel>
              <Select
                fullWidth
                value={assignedBus}
                onChange={(e) => setAssignedBus(e.target.value)}
                displayEmpty
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <Typography color="#999">Select a bus</Typography>
                </MenuItem>
                {buses.map((bus) => (
                  <MenuItem key={bus.id} value={bus.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <DirectionsBusIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                      <Typography fontSize="14px">{bus.name} ({bus.number})</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
              <InputLabel sx={labelSx}>
                <SyncAltIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                Trip Type <span className="required">*</span>
              </InputLabel>
              <Select
                fullWidth
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                displayEmpty
                sx={selectSx}
                renderValue={(selected) => {
                  if (!selected) return <Typography color="#999">Select type</Typography>;
                  const item = tripTypes.find(t => t.value === selected);
                  return item ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {item.icon}
                      <Typography fontSize="14px">{item.label}</Typography>
                    </Box>
                  ) : selected;
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="#999">Select type</Typography>
                </MenuItem>
                {tripTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {type.icon}
                      <Typography fontSize="14px">{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
              <InputLabel sx={labelSx}>
                <ScheduleIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                Trip Slot <span className="required">*</span>
              </InputLabel>
              <Select
                fullWidth
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                displayEmpty
                sx={selectSx}
                renderValue={(selected) => {
                  if (!selected) return <Typography color="#999">Select slot</Typography>;
                  const item = TripSlot.find(t => t.value === selected);
                  return item ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {item.icon}
                      <Typography fontSize="14px">{item.label}</Typography>
                    </Box>
                  ) : selected;
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="#999">Select slot</Typography>
                </MenuItem>
                {TripSlot.map((slot) => (
                  <MenuItem key={slot.value} value={slot.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {slot.icon}
                      <Typography fontSize="14px">{slot.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {/* Bus Route Info */}
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
            Bus - A
          </Box>

          <Box sx={{ backgroundColor: "#fff", border: "1px solid rgb(199, 210, 254)", borderRadius: "4px", borderTopLeftRadius: 0, mb: 2 }}>
            <TableContainer>
              <Table sx={{ minWidth: '100%' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#EEF2FF" }}>
                    <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555", py: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        Bus Route Name
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
                        <FmdGoodIcon sx={{ fontSize: 16, color: "#00796b" }} />
                        No. of Bus Stops
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "600", fontSize: "13px", color: "#555" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <EventSeatIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        Seats Occupied
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                    <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
                        Morning Periyakovil Route Bus
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
                        Pickup
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
                        Morning
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
                        12
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
                        30/40
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Bus Stops Fee Structure */}
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
            {/* Bus stops data */}
            {[
              { id: 1, name: "Big temple bustop" },
              { id: 2, name: "Rane paradise bustop" },
              { id: 3, name: "Sathya stadium bustop" },
              { id: 4, name: "Ramnagar bustop" },
              { id: 5, name: "Anna nagar bustop" },
              { id: 6, name: "Elizanagar bustop" }
            ].map((stop, index) => (
              <Box
                key={stop.id}
                sx={{
                  borderBottom: index !== 5 ? "1px solid #e0e0e0" : "none",

                }}
              >
                {/* Stop Header */}
                <Box
                  sx={{
                    bgcolor: "#ECFDF5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:"space-between",
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
                      {stop.id}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <FmdGoodIcon sx={{ fontSize: 16, color: "#00796b" }} />
                      <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                        Stop {stop.id} - {stop.name}
                      </Typography>

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

          {/* Action Buttons */}
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
              variant="contained"
              sx={{

                backgroundColor: websiteSettings.mainColor,
                borderRadius: "30px",
                textTransform: "none",
                ml: "6px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                border: "1px solid rgba(0,0,0,0.1)",
                px: 3,
                height: "30px",
                color: websiteSettings.textColor,
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
