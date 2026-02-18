import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import Loader from '../../../Loader';
import SnackBar from '../../../SnackBar';
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { transpoartFeeFetch, transpoartFeeFetchID, updateTranspoartSchoolFee, deleteTranspoartFeesStructure, approvalStatusCheckTranspoart } from '../../../../Api/Api';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import SaveIcon from '@mui/icons-material/Save';

export default function CreatedTransportFees() {
  const navigate = useNavigate();
  const websiteSettings = useSelector(selectWebsiteSettings);
  const isExpanded = useSelector((state) => state.sidebar.isExpanded);
  const grades = useSelector(selectGrades);
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber;
  const userType = user.userType;
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [createdFees, setCreatedFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedFeeDetails, setSelectedFeeDetails] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFeeData, setEditFeeData] = useState(null);
  const [editFeeAmounts, setEditFeeAmounts] = useState({});
  const [editDueDate, setEditDueDate] = useState(dayjs());
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetFee, setDeleteTargetFee] = useState(null);
  const token = "123";

  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const labelSx = {
    color: "#333",
    fontWeight: 600,
    fontSize: "13px",
    mb: 0.75,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  };

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

  useEffect(() => {
    fetchCreatedFees();
  }, [selectedYear]);

  useEffect(() => {
    filterFees();
  }, [searchQuery, createdFees]);

  const fetchCreatedFees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(approvalStatusCheckTranspoart, {
        params: {
          RollNumber: rollNumber,
          Year: selectedYear,
          Status: "Approved"
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.fees && Array.isArray(response.data.fees)) {
        // Group fees by routeInformationId
        const groupedFees = response.data.fees.reduce((acc, fee) => {
          const routeId = fee.routeInformationId;
          if (!acc[routeId]) {
            acc[routeId] = {
              routeInformationId: routeId,
              tripName: fee.tripName,
              tripType: fee.tripType,
              tripSlot: fee.tripSlot,
              year: fee.year,
              level: fee.level,
              stops: []
            };
          }
          acc[routeId].stops.push(fee);
          return acc;
        }, {});

        const feesArray = Object.values(groupedFees);
        setCreatedFees(feesArray);
      }
    } catch (error) {
      console.error("Error fetching created fees:", error);
      setMessage('Failed to load created fees');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = [...createdFees];

    // Filter by search query only (year filtering is done by API)
    if (searchQuery) {
      filtered = filtered.filter(fee =>
        fee.tripName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.tripType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.tripSlot?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFees(filtered);
  };

  const handleViewDetails = (fee) => {
    setSelectedFeeDetails(fee);
    setOpenViewDialog(true);
  };

  const handleRefresh = () => {
    fetchCreatedFees();
    setSearchQuery('');
    setSelectedYear(currentAcademicYear);
  };

  // Utility function to convert grade sign to API key format
  const convertGradeSignToApiKey = (gradeSign) => {
    if (!gradeSign) return '';
    const normalized = gradeSign.replace(/[-\s]/g, '').toLowerCase();
    if (normalized === 'prekg') return 'prekg';
    if (normalized === 'lkg') return 'lkg';
    if (normalized === 'ukg') return 'ukg';
    return normalized;
  };

  // Utility function to convert API key back to grade ID
  const findGradeIdByApiKey = (apiKey) => {
    const grade = grades.find(g => {
      const gradeApiKey = convertGradeSignToApiKey(g.sign);
      return gradeApiKey === apiKey.toLowerCase();
    });
    return grade ? grade.id : null;
  };

  // Handle Edit - Fetch fee details by ID
  const handleEdit = async (routeInformationId) => {
    setIsLoading(true);
    try {
      // Find a stop ID from the fee to fetch details
      const fee = createdFees.find(f => f.routeInformationId === routeInformationId);
      if (!fee || !fee.stops || fee.stops.length === 0) {
        setMessage('No fee details found');
        setColor('error');
        setStatus(true);
        setOpen(true);
        setIsLoading(false);
        return;
      }

      // Fetch fee details using the first stop's id
      const firstStopId = fee.stops[0].id; // Use 'id' field from transpoartFeeFetch response
      const response = await axios.get(transpoartFeeFetchID, {
        params: { Id: firstStopId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        // Set edit data
        setEditFeeData(fee);

        // Pre-populate fee amounts
        const feeAmountsMap = {};
        fee.stops.forEach(stop => {
          // Extract grade fees from the stop.grades object
          Object.entries(stop.grades).forEach(([gradeKey, amount]) => {
            const gradeId = findGradeIdByApiKey(gradeKey);
            if (gradeId) {
              feeAmountsMap[`${stop.routeStopsId}_${gradeId}`] = amount;
            }
          });
        });
        setEditFeeAmounts(feeAmountsMap);

        // Set due date from first stop
        if (fee.stops[0]?.dueDate) {
          setEditDueDate(dayjs(fee.stops[0].dueDate));
        }

        setOpenEditDialog(true);
      }
    } catch (error) {
      console.error("Error fetching fee details:", error);
      setMessage('Failed to load fee details for editing');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit Fee Amount Change
  const handleEditFeeAmountChange = (stopId, gradeId, value) => {
    if (value === '' || /^\d+$/.test(value)) {
      setEditFeeAmounts(prev => ({
        ...prev,
        [`${stopId}_${gradeId}`]: value
      }));
    }
  };

  // Handle Delete - Open confirmation dialog
  const handleDeleteClick = (fee) => {
    setDeleteTargetFee(fee);
    setOpenDeleteDialog(true);
  };

  // Handle Delete Confirm - Delete all stops for the route
  const handleDeleteConfirm = async () => {
    if (!deleteTargetFee) return;

    setIsLoading(true);
    try {
      // Delete all stops for this route
      const deletePromises = deleteTargetFee.stops.map(stop =>
        axios.delete(deleteTranspoartFeesStructure, {
          params: {
            transpoartFeesID: stop.id,
            RollNumber: rollNumber
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      setMessage(`Transport fee structure deleted successfully (${deleteTargetFee.stops.length} stop(s) removed)`);
      setColor('success');
      setStatus(true);
      setOpen(true);

      // Close dialog and refresh data
      setOpenDeleteDialog(false);
      setDeleteTargetFee(null);
      fetchCreatedFees();

    } catch (error) {
      console.error("Error deleting transport fee:", error);
      setMessage(error.response?.data?.message || 'Failed to delete transport fee structure');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update - Submit edited fees
  const handleUpdate = async () => {
    if (!editFeeData) return;

    if (!editDueDate) {
      setMessage('Please select a due date');
      setColor('error');
      setStatus(true);
      setOpen(true);
      return;
    }

    // Check if at least one fee amount is entered
    const hasAnyFee = Object.values(editFeeAmounts).some(amount => amount && amount > 0);
    if (!hasAnyFee) {
      setMessage('Please enter at least one fee amount');
      setColor('error');
      setStatus(true);
      setOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      // Create routes array for update
      const routes = [];

      editFeeData.stops.forEach(stop => {
        const gradeFees = {};
        let hasFeesForThisStop = false;

        grades.forEach(grade => {
          const feeKey = `${stop.routeStopsId}_${grade.id}`;
          const feeAmount = editFeeAmounts[feeKey];

          if (feeAmount && feeAmount > 0) {
            const apiKey = convertGradeSignToApiKey(grade.sign);
            gradeFees[apiKey] = parseInt(feeAmount);
            hasFeesForThisStop = true;
          }
        });

        if (hasFeesForThisStop) {
          routes.push({
            transpoartFeesID: stop.id, // Use 'id' field from transpoartFeeFetch response
            routeStopsId: stop.routeStopsId,
            ...gradeFees,
            dueDate: dayjs(editDueDate).format('YYYY-MM-DDTHH:mm:ss')
          });
        }
      });

      if (routes.length === 0) {
        setMessage('No fee amounts to update');
        setColor('warning');
        setStatus(true);
        setOpen(true);
        setIsLoading(false);
        return;
      }

      // Create update payload
      const payload = {
        rollNumber: rollNumber,
        year: editFeeData.year,
        routeInformationId: editFeeData.routeInformationId,
        routes: routes
      };

      // Send update request
      await axios.put(updateTranspoartSchoolFee, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(`Transport fee structure updated successfully for ${routes.length} stop(s)`);
      setColor('success');
      setStatus(true);
      setOpen(true);

      // Close dialog and refresh data
      setOpenEditDialog(false);
      setEditFeeData(null);
      setEditFeeAmounts({});
      fetchCreatedFees();

    } catch (error) {
      console.error("Error updating transport fee:", error);
      setMessage(error.response?.data?.message || 'Failed to update transport fee structure');
      setColor('error');
      setStatus(true);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ width: "100%", minHeight: "100vh" }}>
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
                Created Transport Fees
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{display:"flex", justifyContent:"end"}}>
              <Box sx={{ minWidth: 140 }}>
                <Autocomplete
                  size="small"Academic Year
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
        </Box>

        {/* Main Content */}
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>

          {/* Filters */}
          <Card sx={{ mb: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <InputLabel sx={labelSx}>
                    <SearchIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                    Search
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by trip name or bus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18, color: "#999" }} />
                          </InputAdornment>
                        ),
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 44,
                        fontSize: "14px",
                      }
                    }}
                  />
                </Grid>

             
              </Grid>
            </CardContent>
          </Card>

          {/* Results Count */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "14px", color: "#666", fontWeight: 600 }}>
              Showing {filteredFees.length} result{filteredFees.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Fees Table */}
          <Card sx={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F5F5F5" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "13px", color: "#333", py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        Trip Name
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "13px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <DirectionsBusIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        Trip Type
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "13px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <CalendarMonthIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        Trip Slot
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "13px", color: "#333" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <AttachMoneyIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        Stops Count
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "13px", color: "#333" }}>
                      Academic Year
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "13px", color: "#333", textAlign: "center" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                        <Box>
                          <DirectionsBusIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                          <Typography sx={{ fontSize: "16px", color: "#666", fontWeight: 600 }}>
                            No Transport Fees Found
                          </Typography>
                          <Typography sx={{ fontSize: "14px", color: "#999", mt: 0.5 }}>
                            {searchQuery || selectedYear !== 'All'
                              ? 'Try adjusting your filters'
                              : 'Create your first transport fee structure'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map((fee, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": { bgcolor: "#fafafa" },
                          transition: "background-color 0.2s"
                        }}
                      >
                        <TableCell sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            {fee.tripName || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
                          <Chip
                            label={fee.tripType?.charAt(0).toUpperCase() + fee.tripType?.slice(1) || 'N/A'}
                            size="small"
                            sx={{
                              bgcolor: fee.tripType?.toLowerCase() === 'pickup' ? "#E3F2FD" :
                                fee.tripType?.toLowerCase() === 'drop' ? "#FFF3E0" : "#F3E5F5",
                              color: fee.tripType?.toLowerCase() === 'pickup' ? "#1565C0" :
                                fee.tripType?.toLowerCase() === 'drop' ? "#E65100" : "#6A1B9A",
                              fontWeight: 600,
                              fontSize: "12px"
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
                          <Chip
                            label={fee.tripSlot?.charAt(0).toUpperCase() + fee.tripSlot?.slice(1) || 'N/A'}
                            size="small"
                            sx={{
                              bgcolor: "#FFF3E0",
                              color: "#E65100",
                              fontWeight: 600,
                              fontSize: "12px"
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
                          <Chip
                            label={`${fee.stops?.length || 0} Stops`}
                            size="small"
                            sx={{
                              bgcolor: "#E8F5E9",
                              color: "#2E7D32",
                              fontWeight: 600,
                              fontSize: "12px"
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "14px", color: "#555" }}>
                          {fee.year || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <Tooltip title="View Details" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(fee)}
                                sx={{
                                  color: "#1976d2",
                                  "&:hover": { bgcolor: "#E3F2FD" }
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(fee.routeInformationId)}
                                sx={{
                                  color: "#FF9800",
                                  "&:hover": { bgcolor: "#FFF3E0" }
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(fee)}
                                sx={{
                                  color: "#f44336",
                                  "&:hover": { bgcolor: "#FFEBEE" }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        {/* View Details Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
            }
          }}
        >
          <DialogTitle sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            py: 3,
            px: 3
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <DirectionsBusIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "20px", fontWeight: 700, mb: 0.5 }}>
                    {selectedFeeDetails?.tripName}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", opacity: 0.9 }}>
                    Transport Fee Structure Details
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setOpenViewDialog(false)}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 0, bgcolor: "#f8f9fa" }}>
            {selectedFeeDetails && (
              <Box>
                {/* Summary Cards */}
                <Box sx={{ bgcolor: "#fff", px: 3, py: 2.5, borderBottom: "1px solid #e9ecef" }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#f0f4ff",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #d6e4ff"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Trip Type
                        </Typography>
                        <Chip
                          label={selectedFeeDetails.tripType?.charAt(0).toUpperCase() + selectedFeeDetails.tripType?.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: selectedFeeDetails.tripType?.toLowerCase() === 'pickup' ? "#d6e4ff" :
                              selectedFeeDetails.tripType?.toLowerCase() === 'drop' ? "#ffe7d6" : "#f3e5f5",
                            color: selectedFeeDetails.tripType?.toLowerCase() === 'pickup' ? "#1565C0" :
                              selectedFeeDetails.tripType?.toLowerCase() === 'drop' ? "#E65100" : "#6A1B9A",
                            fontWeight: 600,
                            fontSize: "12px",
                            height: "26px"
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#fff8e1",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #ffecb3"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Trip Slot
                        </Typography>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333" }}>
                          {selectedFeeDetails.tripSlot?.charAt(0).toUpperCase() + selectedFeeDetails.tripSlot?.slice(1)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#f1f8f4",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #c8e6d0"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Academic Year
                        </Typography>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333" }}>
                          {selectedFeeDetails.year}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#fef3f3",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #ffd6d6"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Total Stops
                        </Typography>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333" }}>
                          {selectedFeeDetails.stops?.length || 0} Stops
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Stops Details */}
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333", mb: 2.5 }}>
                    Stop-wise Fee Structure
                  </Typography>

                  {selectedFeeDetails.stops && selectedFeeDetails.stops.map((stop, index) => (
                    <Card key={index} sx={{
                      mb: 2.5,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                      border: "1px solid #e9ecef",
                      overflow: "hidden"
                    }}>
                      {/* Stop Header */}
                      <Box sx={{
                        bgcolor: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #e9ecef"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            bgcolor: "#667eea",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700
                          }}>
                            {index + 1}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>
                              {stop.stopPlace}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: "#6c757d" }}>
                              Stop {index + 1} of {selectedFeeDetails.stops.length}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={<CalendarMonthIcon sx={{ fontSize: 14 }} />}
                          label={`Due: ${dayjs(stop.dueDate).format('DD MMM YYYY')}`}
                          size="small"
                          sx={{
                            bgcolor: "#fff",
                            color: "#667eea",
                            fontWeight: 600,
                            fontSize: "11px",
                            height: "28px",
                            border: "1px solid #d6e4ff"
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 2.5 }}>
                        {/* Grade Fees Grid */}
                        <Grid container spacing={1.5}>
                          {stop.grades && Object.entries(stop.grades).map(([grade, amount]) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={grade}>
                              <Box sx={{
                                bgcolor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                borderRadius: "8px",
                                p: 1.5,
                                textAlign: "center",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#667eea",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.1)"
                                }
                              }}>
                                <Typography sx={{
                                  fontSize: "10px",
                                  color: "#6c757d",
                                  mb: 0.5,
                                  textTransform: "uppercase",
                                  fontWeight: 700,
                                  letterSpacing: "0.5px"
                                }}>
                                  {grade}
                                </Typography>
                                <Typography sx={{
                                  fontSize: "15px",
                                  fontWeight: 700,
                                  color: "#00796b",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.3
                                }}>
                                  <span style={{ fontSize: "12px" }}>₹</span>{amount.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Footer Info */}
                        {stop.createdByRollName && (
                          <Box sx={{
                            mt: 2.5,
                            pt: 2,
                            borderTop: "1px solid #e9ecef",
                            bgcolor: "#f8f9fa",
                            borderRadius: "8px",
                            p: 1.5
                          }}>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: "#667eea"
                                  }} />
                                  <Box>
                                    <Typography sx={{ fontSize: "10px", color: "#6c757d", textTransform: "uppercase", fontWeight: 600 }}>
                                      Created By
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                                      {stop.createdByRollName}
                                    </Typography>
                                    <Typography sx={{ fontSize: "10px", color: "#999" }}>
                                      {dayjs(stop.createdOn).format('DD MMM YYYY, HH:mm')}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              {stop.approvedByRollName && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      bgcolor: "#10b981"
                                    }} />
                                    <Box>
                                      <Typography sx={{ fontSize: "10px", color: "#6c757d", textTransform: "uppercase", fontWeight: 600 }}>
                                        Approved By
                                      </Typography>
                                      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#10b981" }}>
                                        {stop.approvedByRollName}
                                      </Typography>
                                      <Typography sx={{ fontSize: "10px", color: "#999" }}>
                                        {dayjs(stop.approvedOnDate).format('DD MMM YYYY, HH:mm')}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #e9ecef" }}>
            <Button
              onClick={() => setOpenViewDialog(false)}
              variant="contained"
              sx={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                bgcolor: "#667eea",
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#5568d3" }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
            }
          }}
        >
          <DialogTitle sx={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "#fff",
            py: 3,
            px: 3
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <EditIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "20px", fontWeight: 700, mb: 0.5 }}>
                    Edit Transport Fee Structure
                  </Typography>
                  <Typography sx={{ fontSize: "13px", opacity: 0.9 }}>
                    {editFeeData?.tripName} • {editFeeData?.year}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setOpenEditDialog(false)}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 0, bgcolor: "#f8f9fa" }}>
            {editFeeData && (
              <Box>
                {/* Summary Section */}
                <Box sx={{ bgcolor: "#fff", px: 3, py: 2.5, borderBottom: "1px solid #e9ecef" }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#fff3e0",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #ffe0b2"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Trip Type
                        </Typography>
                        <Chip
                          label={editFeeData.tripType?.charAt(0).toUpperCase() + editFeeData.tripType?.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: editFeeData.tripType?.toLowerCase() === 'pickup' ? "#d6e4ff" :
                              editFeeData.tripType?.toLowerCase() === 'drop' ? "#ffe7d6" : "#f3e5f5",
                            color: editFeeData.tripType?.toLowerCase() === 'pickup' ? "#1565C0" :
                              editFeeData.tripType?.toLowerCase() === 'drop' ? "#E65100" : "#6A1B9A",
                            fontWeight: 600,
                            fontSize: "12px",
                            height: "26px"
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#fff8e1",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #ffecb3"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Trip Slot
                        </Typography>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333" }}>
                          {editFeeData.tripSlot?.charAt(0).toUpperCase() + editFeeData.tripSlot?.slice(1)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#f1f8f4",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #c8e6d0"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Academic Year
                        </Typography>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333" }}>
                          {editFeeData.year}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{
                        bgcolor: "#fef3f3",
                        borderRadius: "12px",
                        p: 2,
                        border: "1px solid #ffd6d6"
                      }}>
                        <Typography sx={{ fontSize: "11px", color: "#6c757d", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                          Total Stops
                        </Typography>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333" }}>
                          {editFeeData.stops?.length || 0} Stops
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Due Date Selector */}
                  <Box sx={{ mt: 2 }}>
                    <InputLabel sx={labelSx}>
                      <CalendarMonthIcon sx={{ fontSize: 15, color: "#FF9800" }} />
                      Due Date <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span>
                    </InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={editDueDate}
                        onChange={(newValue) => setEditDueDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: {
                              maxWidth: 300,
                              "& .MuiOutlinedInput-root": {
                                height: 44,
                                borderRadius: "4px",
                                fontSize: "14px",
                                backgroundColor: "#fff",
                                transition: "all 0.2s ease",
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#FF9800",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#FF9800",
                                },
                                "&.Mui-focused": {
                                  boxShadow: "0 0 0 2px rgba(255, 152, 0, 0.1)",
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
                  </Box>
                </Box>

                {/* Stops Fee Edit Section */}
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#333", mb: 2.5 }}>
                    Edit Stop-wise Fee Structure
                  </Typography>

                  {editFeeData.stops && editFeeData.stops.map((stop, index) => (
                    <Card key={index} sx={{
                      mb: 2.5,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                      border: "1px solid #e9ecef",
                      overflow: "hidden"
                    }}>
                      {/* Stop Header */}
                      <Box sx={{
                        bgcolor: "#fff3e0",
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #ffe0b2"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            bgcolor: "#FF9800",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700
                          }}>
                            {index + 1}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>
                              {stop.stopPlace}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: "#6c757d" }}>
                              Stop {index + 1} of {editFeeData.stops.length}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 2.5 }}>
                        {/* Grade Fees Edit Grid */}
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
                                  borderRadius: "8px",
                                  p: 1.5,
                                  bgcolor: "#fafafa",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    borderColor: "#FF9800",
                                    boxShadow: "0 2px 4px rgba(255, 152, 0, 0.1)"
                                  }
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#666",
                                    mb: 0.75,
                                    textTransform: "uppercase"
                                  }}
                                >
                                  {grade.sign}
                                </Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Amount"
                                  value={editFeeAmounts[`${stop.routeStopsId}_${grade.id}`] || ''}
                                  onChange={(e) => handleEditFeeAmountChange(stop.routeStopsId, grade.id, e.target.value)}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Typography sx={{ fontSize: "13px", color: "#FF9800", fontWeight: 600 }}>
                                            ₹
                                          </Typography>
                                        </InputAdornment>
                                      ),
                                    }
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontSize: "14px",
                                      bgcolor: "#fff",
                                      borderRadius: "4px",
                                      "& fieldset": {
                                        borderColor: "#e0e0e0"
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "#bdbdbd"
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#FF9800",
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
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #e9ecef" }}>
            <Button
              onClick={() => setOpenEditDialog(false)}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: "#666",
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                bgcolor: "#FF9800",
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#F57C00" }
              }}
            >
              Update Fee Structure
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: "#FFEBEE",
            color: "#c62828",
            py: 2.5,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 2
          }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "rgba(198, 40, 40, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <DeleteIcon sx={{ fontSize: 22, color: "#c62828" }} />
            </Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
              Delete Transport Fee Structure
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ py: 3, px: 3 }}>
            {deleteTargetFee && (
              <Box>
                <Typography sx={{ fontSize: "15px", color: "#333", mb: 2, lineHeight: 1.6 }}>
                  Are you sure you want to delete the transport fee structure for <strong>{deleteTargetFee.tripName}</strong>?
                </Typography>

                <Box sx={{
                  bgcolor: "#FFF3E0",
                  border: "1px solid #FFE0B2",
                  borderRadius: "8px",
                  p: 2,
                  mb: 2
                }}>
                  <Typography sx={{ fontSize: "13px", color: "#E65100", fontWeight: 600, mb: 1 }}>
                    ⚠️ This action will delete:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    <li>
                      <Typography sx={{ fontSize: "13px", color: "#666" }}>
                        <strong>{deleteTargetFee.stops?.length || 0} stop(s)</strong> with all their fee structures
                      </Typography>
                    </li>
                    <li>
                      <Typography sx={{ fontSize: "13px", color: "#666" }}>
                        Trip: <strong>{deleteTargetFee.tripType}</strong> • <strong>{deleteTargetFee.tripSlot}</strong>
                      </Typography>
                    </li>
                    <li>
                      <Typography sx={{ fontSize: "13px", color: "#666" }}>
                        Academic Year: <strong>{deleteTargetFee.year}</strong>
                      </Typography>
                    </li>
                  </Box>
                </Box>

                <Typography sx={{ fontSize: "14px", color: "#d32f2f", fontWeight: 600 }}>
                  This action cannot be undone!
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fafafa", borderTop: "1px solid #e0e0e0" }}>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: "#666",
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                bgcolor: "#d32f2f",
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#c62828" }
              }}
            >
              Delete Fee Structure
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
