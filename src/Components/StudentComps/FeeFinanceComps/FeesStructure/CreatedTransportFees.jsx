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
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
  const [editSameForAll, setEditSameForAll] = useState(false);
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
      setMessage('Failed to load created fees');
      setColor(false);
      setStatus(false);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = [...createdFees];

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

  const handleEdit = async (routeInformationId) => {
    setIsLoading(true);
    try {
      const fee = createdFees.find(f => f.routeInformationId === routeInformationId);
      if (!fee || !fee.stops || fee.stops.length === 0) {
        setMessage('No fee details found');
        setColor(false);
        setStatus(false);
        setOpen(true);
        setIsLoading(false);
        return;
      }

      const firstStopId = fee.stops[0].id;
      const response = await axios.get(transpoartFeeFetchID, {
        params: { Id: firstStopId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setEditFeeData(fee);

        const feeAmountsMap = {};
        fee.stops.forEach(stop => {
          Object.entries(stop.grades).forEach(([gradeKey, amount]) => {
            const gradeId = findGradeIdByApiKey(gradeKey);
            if (gradeId) {
              feeAmountsMap[`${stop.routeStopsId}_${gradeId}`] = amount;
            }
          });
        });
        setEditFeeAmounts(feeAmountsMap);

        if (fee.stops[0]?.dueDate) {
          setEditDueDate(dayjs(fee.stops[0].dueDate));
        }

        setOpenEditDialog(true);
      }
    } catch (error) {
      setMessage('Failed to load fee details for editing');
      setColor(false);
      setStatus(false);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFeeAmountChange = (stopId, gradeId, value) => {
    const stripped = value.replace(/^0+(\d)/, '$1');
    if (stripped === '' || /^\d+$/.test(stripped)) {
      if (editSameForAll && editFeeData) {
        setEditFeeAmounts(prev => {
          const updated = { ...prev };
          editFeeData.stops.forEach(stop => {
            grades.forEach(grade => {
              updated[`${stop.routeStopsId}_${grade.id}`] = stripped;
            });
          });
          return updated;
        });
      } else {
        setEditFeeAmounts(prev => ({
          ...prev,
          [`${stopId}_${gradeId}`]: stripped
        }));
      }
    }
  };

  const handleDeleteClick = (fee) => {
    setDeleteTargetFee(fee);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetFee) return;

    setIsLoading(true);
    try {
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

      setMessage(`Transport fee structure deleted successfully`);
      setColor(true);
      setStatus(true);
      setOpen(true);

      setOpenDeleteDialog(false);
      setDeleteTargetFee(null);
      fetchCreatedFees();

    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete transport fee structure');
      setColor(false);
      setStatus(false);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editFeeData) return;

    if (!editDueDate) {
      setMessage('Please select a due date');
      setColor(false);
      setStatus(false);
      setOpen(true);
      return;
    }

    const hasAnyFee = Object.values(editFeeAmounts).some(amount => amount && amount > 0);
    if (!hasAnyFee) {
      setMessage('Please enter at least one fee amount');
      setColor(false);
      setStatus(false);
      setOpen(true);
      return;
    }

    setIsLoading(true);
    try {
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
            transpoartFeesID: stop.id,
            routeStopsId: stop.routeStopsId,
            ...gradeFees,
            dueDate: dayjs(editDueDate).format('YYYY-MM-DDTHH:mm:ss')
          });
        }
      });

      if (routes.length === 0) {
        setMessage('No fee amounts to update');
        setColor(false);
        setStatus(false);
        setOpen(true);
        setIsLoading(false);
        return;
      }

      const payload = {
        rollNumber: rollNumber,
        year: editFeeData.year,
        routeInformationId: editFeeData.routeInformationId,
        routes: routes
      };

      await axios.put(updateTranspoartSchoolFee, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('Transport fee structure updated successfully');
      setColor(true);
      setStatus(true);
      setOpen(true);

      setOpenEditDialog(false);
      setEditFeeData(null);
      setEditFeeAmounts({});
      setEditSameForAll(false);
      fetchCreatedFees();

    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update transport fee structure');
      setColor(false);
      setStatus(false);
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

          {/* Info note */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: '#FFF8E1', border: '1px solid #FFE082',
            borderRadius: '8px', px: 2, py: 1, mb: 2, mt: 1,
          }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#F9A825', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: '#795548' }}>
              Editing and deleting fee details is only allowed before any student has paid. Once even one student has paid, both edit and delete will be disabled.
            </Typography>
          </Box>

          {/* Toolbar: search + results count */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search by trip name or slot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  fontSize: "13px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  "& fieldset": { borderColor: "#E5E7EB" },
                  "&:hover fieldset": { borderColor: "#1976d2" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                }
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1976d2" }} />
              <Typography sx={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
                <span style={{ fontWeight: 700, color: "#1F2937" }}>{filteredFees.length}</span> trip{filteredFees.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>
          </Box>

          {/* Fees Table */}
          <Card sx={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderRadius: "10px", overflow: "hidden", border: "1px solid #F0F0F0" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8F9FB", borderBottom: "2px solid #E5E7EB" }}>
                    {[
                      { icon: <RouteIcon sx={{ fontSize: 14 }} />, label: "Trip Name" },
                      { icon: <DirectionsBusIcon sx={{ fontSize: 14 }} />, label: "Trip Type" },
                      { icon: <CalendarMonthIcon sx={{ fontSize: 14 }} />, label: "Trip Slot" },
                      { icon: <AttachMoneyIcon sx={{ fontSize: 14 }} />, label: "Stops Count" },
                      { icon: null, label: "Academic Year" },
                      { icon: null, label: "Actions", center: true },
                    ].map(({ icon, label, center }) => (
                      <TableCell
                        key={label}
                        sx={{
                          fontWeight: 700, fontSize: "12px", color: "#6B7280",
                          textTransform: "uppercase", letterSpacing: "0.05em",
                          py: 1.5, textAlign: center ? "center" : "left",
                          borderBottom: "none",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, justifyContent: center ? "center" : "flex-start" }}>
                          {icon && <Box sx={{ color: "#1976d2" }}>{icon}</Box>}
                          {label}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 8, border: "none" }}>
                        <DirectionsBusIcon sx={{ fontSize: 44, color: "#D1D5DB", mb: 1.5 }} />
                        <Typography sx={{ fontSize: "15px", color: "#6B7280", fontWeight: 600 }}>
                          No Transport Fees Found
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
                          {searchQuery ? 'Try adjusting your search' : 'Create your first transport fee structure'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map((fee, index) => {
                      const tripType = fee.tripType?.toLowerCase();
                      const tripSlot = fee.tripSlot?.toLowerCase();
                      const tripTypeStyle =
                        tripType === 'pickup' ? { bg: "#EFF6FF", color: "#1D4ED8" } :
                        tripType === 'drop'   ? { bg: "#FFF7ED", color: "#C2410C" } :
                                               { bg: "#FAF5FF", color: "#7C3AED" };
                      const tripSlotStyle =
                        tripSlot === 'morning'   ? { bg: "#EFF6FF", color: "#1D4ED8" } :
                        tripSlot === 'afternoon' ? { bg: "#FFF7ED", color: "#C2410C" } :
                        tripSlot === 'evening'   ? { bg: "#FAF5FF", color: "#7C3AED" } :
                                                   { bg: "#F0FDF4", color: "#15803D" };
                      return (
                      <TableRow
                        key={index}
                        sx={{
                          borderBottom: "1px solid #F3F4F6",
                          "&:last-child": { borderBottom: "none" },
                          "&:hover": { bgcolor: "#FAFBFF" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <TableCell sx={{ py: 1.8 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <RouteIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            </Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1F2937" }}>
                              {fee.tripName || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.8 }}>
                          <Chip
                            label={fee.tripType?.charAt(0).toUpperCase() + fee.tripType?.slice(1) || 'N/A'}
                            size="small"
                            sx={{ bgcolor: tripTypeStyle.bg, color: tripTypeStyle.color, fontWeight: 600, fontSize: "12px", borderRadius: "6px", height: 24 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.8 }}>
                          <Chip
                            label={fee.tripSlot?.charAt(0).toUpperCase() + fee.tripSlot?.slice(1) || 'N/A'}
                            size="small"
                            sx={{ bgcolor: tripSlotStyle.bg, color: tripSlotStyle.color, fontWeight: 600, fontSize: "12px", borderRadius: "6px", height: 24 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.8 }}>
                          <Chip
                            label={`${fee.stops?.length || 0} Stop${fee.stops?.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: "#F0FDF4", color: "#15803D", fontWeight: 600, fontSize: "12px", borderRadius: "6px", height: 24 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.8 }}>
                          <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>
                            {fee.year || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {(() => {
                            const isPaid = fee.stops?.some(stop => stop.isAnyStudentPaid === true);
                            return (
                              <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", alignItems: "center" }}>
                                <Tooltip title="View Details" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDetails(fee)}
                                    sx={{ color: "#1976d2", "&:hover": { bgcolor: "#E3F2FD" } }}
                                  >
                                    <VisibilityIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                {isPaid ? (
                                  <Tooltip title="Cannot edit — a student has already paid this fee" arrow>
                                    <Chip
                                      label="Student Paid"
                                      size="small"
                                      sx={{
                                        height: 22,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        bgcolor: "#FFF3E0",
                                        color: "#E65100",
                                        border: "1px solid #FFB74D",
                                        borderRadius: "6px",
                                        "& .MuiChip-label": { px: 1 },
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <>
                                    <Tooltip title="Edit" arrow>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEdit(fee.routeInformationId)}
                                        sx={{ color: "#FF9800", "&:hover": { bgcolor: "#FFF3E0" } }}
                                      >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete" arrow>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(fee)}
                                        sx={{ color: "#f44336", "&:hover": { bgcolor: "#FFEBEE" } }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    );
                    })
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
            bgcolor: "#FFF3E0",
            borderBottom: "1px solid #FFE0B2",
            py: 2,
            px: 3
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: "#FFE0B2",
                  border: "1px solid #FFCC80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <EditIcon sx={{ fontSize: 20, color: "#E65100" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#E65100" }}>
                    Edit Transport Fee Structure
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#BF360C" }}>
                    {editFeeData?.tripName} • {editFeeData?.year}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => { setOpenEditDialog(false); setEditSameForAll(false); }}
                sx={{
                  color: "#E65100",
                  "&:hover": { bgcolor: "#FFE0B2" }
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

                  {/* Same Fee for All Classes Toggle */}
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editSameForAll}
                          onChange={(e) => setEditSameForAll(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#FF9800' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FF9800' },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#E65100" }}>
                          Same Fee for All Classes
                        </Typography>
                      }
                    />
                  </Box>

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
              {userType === "superadmin" ? "Update Fee Structure" : "Send Update Request"}
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
              {userType === "superadmin" ? "Delete Fee Structure" : "Send Delete Request"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
