import { Autocomplete, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import { approvalStatusCheckTranspoart, deleteTranspoartFeesStructure, deleteTransportFeesStructure } from "../../../../Api/Api";
import NoData from '../../../../Images/Login/No Data.png';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';

export default function TransportFeeApprovalStatus() {
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber;
  const grades = useSelector(selectGrades);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const navigate = useNavigate();
  const location = useLocation();
  const tabIndex = location.state?.tabIndex ?? 1;

  const token = "123";
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');

  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);

  const [feesData, setFeesData] = useState([]);
  const [groupedFees, setGroupedFees] = useState([]);
  const [openReasonId, setOpenReasonId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedFeeForReason, setSelectedFeeForReason] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  useEffect(() => {
    fetchStatusDetails();
  }, [selectedYear]);

  const fetchStatusDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(approvalStatusCheckTranspoart, {
        params: {
          RollNumber: rollNumber,
          Year: selectedYear,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.fees) {
        setFeesData(response.data.fees);
        // Group fees by routeInformationId
        const grouped = response.data.fees.reduce((acc, fee) => {
          const routeId = fee.routeInformationId;
          if (!acc[routeId]) {
            acc[routeId] = {
              id: fee.id, // Store the first fee's ID for deletion
              routeInformationId: routeId,
              tripName: fee.tripName,
              tripType: fee.tripType,
              tripSlot: fee.tripSlot,
              year: fee.year,
              status: fee.status,
              createdBy: fee.createdBy,
              createdOn: fee.createdOn,
              approvedBy: fee.approvedBy,
              approvedOnDate: fee.approvedOnDate,
              reason: fee.reason,
              stops: []
            };
          }
          acc[routeId].stops.push(fee);
          return acc;
        }, {});
        setGroupedFees(Object.values(grouped));
      }
    } catch (error) {
      console.error("Error fetching status details:", error);
      setMessage("Failed to load data");
      setColor(false);
      setStatus(false);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD-MM-YYYY');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD-MM-YYYY hh:mm A');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsLoading(true);
    try {
      await axios.delete(deleteTranspoartFeesStructure, {
        params: {
          transpoartFeesID: deleteId,
          RollNumber: rollNumber,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchStatusDetails();
      setOpenDeleteDialog(false);
      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage("Deleted Successfully");
    } catch (error) {
      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage("Failed to delete. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (routeId) => {
    setExpandedCards(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  const showNoData = !groupedFees.length;

  return (
    <Box sx={{ width: "100%", bgcolor: "#FAFAFA" }}>
      <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
      {isLoading && <Loader />}

      {/* Header */}
      <Box sx={{
        backgroundColor: "#F8FAFC",
        px: 2,
        borderRadius: "10px 10px 0px 0px",
        borderBottom: "1px solid #E8E8E8",
        border: "1px solid #E8E8E8"
      }}>
        <Grid container>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
            <IconButton
              onClick={() => navigate("/dashboardmenu/status", { state: { tabIndex } })}
              sx={{ width: "27px", height: "27px", mt: "3px", mr: 1 }}
            >
              <ArrowBackIcon sx={{ fontSize: 20, color: "#1a1a1a" }} />
            </IconButton>
            <Typography sx={{ fontWeight: "600", fontSize: "18px", color: "#1a1a1a" }}>
              Transport Fee Approval Status
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 1.5,
              py: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#64748B",
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
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                    },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ height: "83vh", overflowY: "auto", px: 2, py: 2 }}>
        {showNoData ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "70vh",
              textAlign: "center",
            }}
          >
            <img
              src={NoData}
              alt="No data"
              style={{
                width: "30%",
                height: "auto",
                marginBottom: "16px",
              }}
            />
            <Typography sx={{ fontSize: "16px", color: "#64748B", fontWeight: 600 }}>
              No Transport Fee Records Found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {groupedFees.map((fee) => (
              <Grid key={fee.routeInformationId} size={{ xs: 12 }}>
                <Card sx={{
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #E8E8E8",
                  bgcolor: "#FFFFFF"
                }}>
                  {/* Card Header */}
                  <Box sx={{
                    bgcolor: "#F8FAFC",
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E8E8E8"
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: "#F0F9FF",
                        border: "1px solid #E0F2FE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <DirectionsBusIcon sx={{ fontSize: 22, color: "#2563EB" }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", mb: 0.3 }}>
                          {fee.tripName}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                          <Chip
                            label={fee.tripType?.charAt(0).toUpperCase() + fee.tripType?.slice(1)}
                            size="small"
                            icon={
                              fee.tripType?.toLowerCase() === 'pickup' ? (
                                <AirportShuttleIcon sx={{ fontSize: 14 }} />
                              ) : fee.tripType?.toLowerCase() === 'drop' ? (
                                <HomeIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <SyncAltIcon sx={{ fontSize: 14 }} />
                              )
                            }
                            sx={{
                              bgcolor: "#F0F9FF",
                              color: "#2563EB",
                              fontWeight: 600,
                              fontSize: "11px",
                              height: "20px",
                              border: "1px solid #BFDBFE"
                            }}
                          />
                          <Chip
                            label={fee.tripSlot?.charAt(0).toUpperCase() + fee.tripSlot?.slice(1)}
                            size="small"
                            sx={{
                              bgcolor: "#F8FAFC",
                              color: "#334155",
                              fontWeight: 600,
                              fontSize: "11px",
                              height: "20px",
                              border: "1px solid #E2E8F0"
                            }}
                          />

                          {/* Status Badge */}
                          {fee.status === "Requested" && (
                            <Chip
                              label="Pending"
                              size="small"
                              sx={{
                                bgcolor: "#FFF3E0",
                                color: "#FF9800",
                                fontWeight: 600,
                                fontSize: "11px",
                                height: "20px",
                                border: "1px solid #FFE0B2"
                              }}
                            />
                          )}
                          {fee.status === "Declined" && (
                            <Chip
                              label="Rejected"
                              size="small"
                              sx={{
                                bgcolor: "#FFEBEE",
                                color: "#DC2626",
                                fontWeight: 600,
                                fontSize: "11px",
                                height: "20px",
                                border: "1px solid #FFCDD2"
                              }}
                            />
                          )}
                          {fee.status === "Approved" && (
                            <Chip
                              label="Approved"
                              size="small"
                              sx={{
                                bgcolor: "#F0FDF4",
                                color: "#16A34A",
                                fontWeight: 600,
                                fontSize: "11px",
                                height: "20px",
                                border: "1px solid #DCFCE7"
                              }}
                            />
                          )}

                          {/* View Reason Button */}
                          {fee.status === "Declined" && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedFeeForReason(fee);
                                setOpenReasonId(fee.routeInformationId);
                              }}
                              sx={{
                                textTransform: "none",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#DC2626",
                                borderColor: "#FCA5A5",
                                height: 20,
                                px: 1,
                                minWidth: "auto",
                                borderRadius: "6px",
                                "&:hover": {
                                  bgcolor: "#FEF2F2",
                                  borderColor: "#DC2626",
                                },
                              }}
                            >
                              View Reason
                            </Button>
                          )}

                          {/* Delete Button */}
                          {fee.status === "Declined" && (
                            <IconButton
                              sx={{
                                width: 24,
                                height: 24,
                                p: 0.5,
                                "&:hover": {
                                  bgcolor: "#FEF2F2",
                                },
                                "&:hover .MuiSvgIcon-root": {
                                  color: "#DC2626",
                                },
                              }}
                              onClick={() => {
                                setDeleteId(fee.id);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon
                                sx={{
                                  fontSize: "18px",
                                  color: "#F87171",
                                  transition: "color 0.2s ease",
                                }}
                              />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.3 }}>
                        Created By
                      </Typography>
                      <Typography sx={{ fontSize: "13px", color: "#1a1a1a", fontWeight: 600 }}>
                        {fee.createdBy}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#64748B", mt: 0.3 }}>
                        {formatDateTime(fee.createdOn)}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    {/* Summary Info */}
                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box sx={{
                          bgcolor: "#F8FAFC",
                          borderRadius: "12px",
                          p: 1.5,
                          border: "1px solid #E2E8F0"
                        }}>
                          <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600 }}>
                            ACADEMIC YEAR
                          </Typography>
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                            {fee.year}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box sx={{
                          bgcolor: "#F0F9FF",
                          borderRadius: "12px",
                          p: 1.5,
                          border: "1px solid #E0F2FE"
                        }}>
                          <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600 }}>
                            TOTAL STOPS
                          </Typography>
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                            {fee.stops?.length || 0} Stops
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box sx={{
                          bgcolor: fee.status === "Approved" ? "#F0FDF4" : fee.status === "Declined" ? "#FEF2F2" : "#FFF7ED",
                          borderRadius: "12px",
                          p: 1.5,
                          border: `1px solid ${fee.status === "Approved" ? "#DCFCE7" : fee.status === "Declined" ? "#FEE2E2" : "#FFEDD5"}`
                        }}>
                          <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600 }}>
                            STATUS
                          </Typography>
                          <Typography sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: fee.status === "Approved" ? "#16A34A" : fee.status === "Declined" ? "#DC2626" : "#F59E0B"
                          }}>
                            {fee.status === "Requested" ? "Pending" : fee.status === "Declined" ? "Rejected" : fee.status}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Expand/Collapse Button */}
                    <Box
                      onClick={() => toggleExpand(fee.routeInformationId)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E8E8E8",
                        mb: expandedCards[fee.routeInformationId] ? 2 : 0,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "#F0F9FF",
                          borderColor: "#BFDBFE"
                        }
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FmdGoodIcon sx={{ fontSize: 18, color: "#2563EB", mr: 1 }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                          Stop-wise Grade Fees
                        </Typography>
                        <Chip
                          label={`${fee.stops?.length || 0} Stops`}
                          size="small"
                          sx={{
                            ml: 1.5,
                            height: "22px",
                            fontSize: "11px",
                            fontWeight: 600,
                            bgcolor: "#E0F2FE",
                            color: "#0369A1",
                            border: "1px solid #BAE6FD"
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        sx={{
                          transform: expandedCards[fee.routeInformationId] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                          bgcolor: "#FFFFFF",
                          border: "1px solid #E8E8E8",
                          width: 32,
                          height: 32,
                          "&:hover": {
                            bgcolor: "#F0F9FF"
                          }
                        }}
                      >
                        <ExpandMoreIcon sx={{ fontSize: 20, color: "#2563EB" }} />
                      </IconButton>
                    </Box>

                    {/* Stops Table - Only show when expanded */}
                    {expandedCards[fee.routeInformationId] && fee.stops && fee.stops.map((stop, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{
                          bgcolor: "#F8FAFC",
                          px: 2,
                          py: 1.5,
                          borderRadius: "12px 12px 0 0",
                          border: "1px solid #E8E8E8",
                          borderBottom: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "8px",
                              bgcolor: "#2563EB",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px",
                              fontWeight: 700
                            }}>
                              {index + 1}
                            </Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                              {stop.stopPlace}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CalendarMonthIcon sx={{ fontSize: 14, color: "#64748B" }} />
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>
                              {formatDate(stop.dueDate)}
                            </Typography>
                          </Box>
                        </Box>
                        <TableContainer sx={{
                          border: "1px solid #E8E8E8",
                          borderRadius: "0 0 12px 12px",
                          overflow: "hidden"
                        }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {Object.keys(stop.grades).map((gradeKey) => (
                                  <TableCell
                                    key={gradeKey}
                                    align="center"
                                    sx={{
                                      bgcolor: "#FAFAFA",
                                      borderRight: "1px solid #E8E8E8",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      color: "#64748B",
                                      py: 1
                                    }}
                                  >
                                    {gradeKey}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                {Object.entries(stop.grades).map(([gradeKey, amount]) => (
                                  <TableCell
                                    key={gradeKey}
                                    align="center"
                                    sx={{
                                      borderRight: "1px solid #E8E8E8",
                                      fontSize: "14px",
                                      fontWeight: 700,
                                      color: "#2563EB",
                                      py: 1.5
                                    }}
                                  >
                                    ₹{amount}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Rejection Reason Dialog */}
      <Dialog
        open={openReasonId !== null}
        onClose={() => {
          setOpenReasonId(null);
          setSelectedFeeForReason(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: "16px",
          fontWeight: 700,
          bgcolor: "#FAFAFA",
          borderBottom: "1px solid #E8E8E8",
          color: "#1a1a1a"
        }}>
          Rejection Reason
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box sx={{
            bgcolor: "#FEF2F2",
            border: "1px solid #FEE2E2",
            borderRadius: "12px",
            p: 2,
          }}>
            <Typography sx={{
              fontSize: "13px",
              color: "#DC2626",
              fontWeight: 600,
              mb: 1,
            }}>
              Reason for Rejection
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#1a1a1a", lineHeight: 1.6 }}>
              {selectedFeeForReason?.reason || "No reason provided"}
            </Typography>
          </Box>

          {selectedFeeForReason?.approvedBy && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: "12px", color: "#64748B", mb: 0.5 }}>
                Rejected By
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                {selectedFeeForReason.approvedBy}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#64748B", mt: 0.5 }}>
                {formatDateTime(selectedFeeForReason.approvedOnDate)}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#FAFAFA", borderTop: "1px solid #E8E8E8" }}>
          <Button
            onClick={() => {
              setOpenReasonId(null);
              setSelectedFeeForReason(null);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          bgcolor: "#FAFAFA",
          borderBottom: "1px solid #E8E8E8",
          color: "#1a1a1a"
        }}>
          Confirm Delete
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Typography sx={{ fontSize: "14px", color: "#1a1a1a" }}>
            Are you sure you want to delete this transport fee structure? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#FAFAFA", borderTop: "1px solid #E8E8E8" }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#DC2626",
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "#B91C1C"
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
