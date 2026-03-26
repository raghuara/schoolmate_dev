import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { approvalStatusCheckTranspoart, deleteTranspoartFeesStructure } from "../../../../Api/Api";
import NoData from '../../../../Images/Login/No Data.png';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dayjs from 'dayjs';

export default function TransportFeeApprovalStatus() {
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber;
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
  const [openActivityLogId, setOpenActivityLogId] = useState(null);

  const statusOptions = [
    { label: "All", value: null },
    { label: "Pending", value: "Requested" },
    { label: "Rejected", value: "Declined" },
    { label: "Approved", value: "Approved" },
  ];
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);

  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD-MM-YYYY');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD/MM/YYYY [at] HH:mm');
  };

  const parseUser = (str) => {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length >= 3) return { rollNumber: parts[0], name: parts[1], role: parts[2] };
    return { rollNumber: "", name: str, role: "" };
  };

  const getRequestBadge = (requestFor) => {
    if (requestFor === 'edit')
      return { label: 'Requested for Edit', bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' };
    if (requestFor === 'delete')
      return { label: 'Requested for Delete', bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
    return { label: 'Requested for New', bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
  };

  useEffect(() => {
    fetchStatusDetails();
  }, [selectedYear, selectedStatus]);

  const fetchStatusDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(approvalStatusCheckTranspoart, {
        params: { RollNumber: rollNumber, Year: selectedYear, Status: selectedStatus?.value },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.fees) {
        setFeesData(response.data.fees);
        const grouped = response.data.fees.reduce((acc, fee) => {
          const routeId = fee.routeInformationId;
          if (!acc[routeId]) {
            acc[routeId] = {
              id: fee.id,
              routeInformationId: routeId,
              tripName: fee.tripName,
              tripType: fee.tripType,
              tripSlot: fee.tripSlot,
              year: fee.year,
              status: fee.status,
              requestFor: fee.requestFor,
              createdBy: fee.createdBy,
              createdOn: fee.createdOn,
              editedBy: fee.editedBy,
              editedOnDate: fee.editedOnDate,
              approvedBy: fee.approvedBy,
              approvedOnDate: fee.approvedOnDate,
              reason: fee.reason,
              stops: [],
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
      setColor(false); setStatus(false); setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await axios.delete(deleteTranspoartFeesStructure, {
        params: { transpoartFeesID: deleteId, RollNumber: rollNumber },
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStatusDetails();
      setOpenDeleteDialog(false);
      setOpen(true); setColor(true); setStatus(true); setMessage("Deleted Successfully");
    } catch (error) {
      setOpen(true); setColor(false); setStatus(false); setMessage("Failed to delete. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (routeId) => {
    setExpandedCards(prev => ({ ...prev, [routeId]: !prev[routeId] }));
  };

  const tripTypeChip = (type) => {
    const t = type?.toLowerCase();
    if (t === 'pickup') return { icon: <AirportShuttleIcon sx={{ fontSize: 13 }} />, bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' };
    if (t === 'drop') return { icon: <HomeIcon sx={{ fontSize: 13 }} />, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' };
    return { icon: <SyncAltIcon sx={{ fontSize: 13 }} />, bgcolor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' };
  };

  return (
    <Box sx={{ width: "100%" }}>
      <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
      {isLoading && <Loader />}

      {/* Header */}
      <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd" }}>
        <Grid container>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
            <IconButton
              onClick={() => navigate("/dashboardmenu/status", { state: { tabIndex } })}
              sx={{ width: "27px", height: "27px", mt: "3px" }}
            >
              <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
            </IconButton>
            <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Transport Fee Approval Status</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: "end", gap: 1.5, py: 1 }}>
            <Autocomplete
              value={selectedStatus}
              sx={{ width: "160px" }}
              options={statusOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              onChange={(e, newValue) => setSelectedStatus(newValue || statusOptions[0])}
              renderInput={(params) => (
                <TextField {...params} sx={{ '& .MuiInputBase-root': { height: 35, fontSize: '14px' } }} />
              )}
            />
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
                    "& .MuiOutlinedInput-root": { borderRadius: "5px", fontSize: 14, height: 35 },
                    "& .MuiOutlinedInput-input": { textAlign: "center", fontWeight: "600" },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ height: "83vh", overflowY: "auto", px: 2 }}>
        {!groupedFees.length ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "77vh", textAlign: "center" }}>
            <img src={NoData} alt="No data" style={{ width: "30%", marginBottom: 16 }} />
            <Typography sx={{ color: "#777", fontWeight: 500 }}>No Transport Fee Records Found</Typography>
          </Box>
        ) : (
          <Grid container sx={{ pb: 2 }}>
            {groupedFees.map((fee) => (
              <Grid key={fee.routeInformationId} size={{ lg: 12, md: 12 }} sx={{ pt: 2 }}>

                {/* Top row: status badge (left) + creator info (right) */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                  {/* Left — status tabs + buttons */}
                  <Box sx={{ display: "flex", alignItems: "end" }}>
                    {fee.status === "Requested" && (
                      <Box sx={{ ml: 0.5, height: 22, px: 1.6, display: "flex", alignItems: "center", gap: 0.6, borderTopLeftRadius: "7px", borderTopRightRadius: "7px", backgroundColor: "#E65100", border: "1px solid #E65100" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#fff" }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff", lineHeight: 1 }}>Pending</Typography>
                      </Box>
                    )}
                    {fee.status === "Declined" && (
                      <Box sx={{ ml: 0.5, height: 22, px: 1.6, display: "flex", alignItems: "center", gap: 0.6, borderTopLeftRadius: "7px", borderTopRightRadius: "7px", backgroundColor: "#B71C1C", border: "1px solid #B71C1C" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#fff" }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff", lineHeight: 1 }}>Rejected</Typography>
                      </Box>
                    )}
                    {fee.status === "Approved" && (
                      <Box sx={{ ml: 0.5, height: 22, px: 1.6, display: "flex", alignItems: "center", gap: 0.6, borderTopLeftRadius: "7px", borderTopRightRadius: "7px", backgroundColor: "#1B5E20", border: "1px solid #1B5E20" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#fff" }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff", lineHeight: 1 }}>Approved</Typography>
                      </Box>
                    )}

                    {/* View reason */}
                    {fee.status === "Declined" && (
                      <Button
                        size="small" variant="outlined"
                        onClick={() => { setSelectedFeeForReason(fee); setOpenReasonId(fee.routeInformationId); }}
                        sx={{ textTransform: "none", fontSize: "12px", fontWeight: 600, color: "#555", borderColor: "#ccc", height: 24, px: 1.2, ml: 1, minWidth: "auto", borderRadius: "6px", "&:hover": { backgroundColor: "#FDECEA", borderColor: "#555" } }}
                      >
                        View reason
                      </Button>
                    )}

                    {/* Reason dialog */}
                    <Dialog open={openReasonId === fee.routeInformationId} onClose={() => { setOpenReasonId(null); setSelectedFeeForReason(null); }} maxWidth="sm" fullWidth>
                      <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                        Rejection Reason
                      </DialogTitle>
                      <DialogContent dividers>
                        <Box sx={{ backgroundColor: "#FFF5F5", border: "1px solid #F5A5A0", borderRadius: "8px", p: 2 }}>
                          <Typography sx={{ fontSize: "13px", color: "#B71C1C", fontWeight: 600, mb: 0.5 }}>Reason</Typography>
                          <Typography sx={{ fontSize: "14px", color: "#333" }}>{selectedFeeForReason?.reason || "No reason provided"}</Typography>
                        </Box>
                      </DialogContent>
                      <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => { setOpenReasonId(null); setSelectedFeeForReason(null); }} variant="outlined" sx={{ textTransform: "none" }}>Close</Button>
                      </DialogActions>
                    </Dialog>

                    {/* Delete */}
                    {fee.status === "Declined" && (
                      <IconButton
                        sx={{ width: 25, height: 25, ml: 1, "&:hover .MuiSvgIcon-root": { color: "red" } }}
                        onClick={() => { setDeleteId(fee.id); setOpenDeleteDialog(true); }}
                      >
                        <DeleteIcon sx={{ fontSize: "20px", color: "#FF00009A", transition: "color 0.2s ease" }} />
                      </IconButton>
                    )}

                    {/* requestFor badge */}
                    {fee.requestFor && fee.requestFor !== 'Approved' && (() => {
                      const badge = getRequestBadge(fee.requestFor);
                      return (
                        <Chip label={badge.label} size="small" sx={{ ml: 1, height: 22, fontSize: '11.5px', fontWeight: 600, bgcolor: badge.bgcolor, color: badge.color, border: badge.border, borderRadius: '6px 6px 0 0' }} />
                      );
                    })()}
                  </Box>

                  {/* Right — creator + activity log */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {(() => {
                      const creator = parseUser(fee.createdBy);
                      return creator ? (
                        <Typography sx={{ fontSize: "11px", color: "#777" }}>
                          By <span style={{ fontWeight: 600, color: "#444" }}>{creator.name}</span>
                          {" · "}{formatDate(fee.createdOn)}
                        </Typography>
                      ) : null;
                    })()}
                    <Tooltip title="View activity log" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => setOpenActivityLogId(fee.routeInformationId)}
                        sx={{ width: 22, height: 22, color: "#9CA3AF", "&:hover": { color: "#2563EB", backgroundColor: "#EFF6FF" } }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>

                    {/* Activity Log Dialog */}
                    <Dialog
                      open={openActivityLogId === fee.routeInformationId}
                      onClose={() => setOpenActivityLogId(null)}
                      maxWidth="xs" fullWidth
                      PaperProps={{ sx: { borderRadius: "12px", overflow: "hidden" } }}
                    >
                      <Box sx={{ px: 2.5, py: 1.8, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <InfoOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
                          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Activity Log</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setOpenActivityLogId(null)} sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#fff" } }}>
                          <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                      <DialogContent sx={{ px: 2.5, py: 2.5 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {/* Created */}
                          {(() => {
                            const u = parseUser(fee.createdBy);
                            return (
                              <Box sx={{ display: "flex", gap: 1.5 }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#E8F5E9", border: "2px solid #4CAF50", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <AddCircleOutlineIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
                                  </Box>
                                  {(fee.editedBy || fee.approvedBy || fee.approvedOnDate) && (
                                    <Box sx={{ width: 2, flex: 1, minHeight: 24, backgroundColor: "#E5E7EB", my: 0.4 }} />
                                  )}
                                </Box>
                                <Box sx={{ pb: 2 }}>
                                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>Created</Typography>
                                  {u && <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", mt: 0.2 }}>{u.name} <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10, backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 600, ml: 0.5 }} /></Typography>}
                                  {u && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.2 }}>{u.rollNumber}</Typography>}
                                  <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{formatDateTime(fee.createdOn)}</Typography>
                                </Box>
                              </Box>
                            );
                          })()}

                          {/* Edited */}
                          {fee.editedBy && (() => {
                            const u = parseUser(fee.editedBy);
                            return (
                              <Box sx={{ display: "flex", gap: 1.5 }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#FFF3E0", border: "2px solid #FF9800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16, color: "#FF9800" }} />
                                  </Box>
                                  {(fee.approvedBy || fee.approvedOnDate) && (
                                    <Box sx={{ width: 2, flex: 1, minHeight: 24, backgroundColor: "#E5E7EB", my: 0.4 }} />
                                  )}
                                </Box>
                                <Box sx={{ pb: 2 }}>
                                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#E65100" }}>Edited</Typography>
                                  {u && <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", mt: 0.2 }}>{u.name} <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10, backgroundColor: "#FFF3E0", color: "#E65100", fontWeight: 600, ml: 0.5 }} /></Typography>}
                                  {u && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.2 }}>{u.rollNumber}</Typography>}
                                  <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{formatDateTime(fee.editedOnDate)}</Typography>
                                </Box>
                              </Box>
                            );
                          })()}

                          {/* Approved / Declined */}
                          {(fee.approvedBy || fee.approvedOnDate) && (() => {
                            const u = parseUser(fee.approvedBy);
                            const isDeclined = fee.status === "Declined";
                            return (
                              <Box sx={{ display: "flex", gap: 1.5 }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: isDeclined ? "#FFEBEE" : "#E8F5E9", border: `2px solid ${isDeclined ? "#f44336" : "#4CAF50"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {isDeclined
                                      ? <CancelOutlinedIcon sx={{ fontSize: 16, color: "#f44336" }} />
                                      : <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#4CAF50" }} />}
                                  </Box>
                                </Box>
                                <Box sx={{ pb: 1 }}>
                                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: isDeclined ? "#C62828" : "#2E7D32" }}>
                                    {isDeclined ? "Rejected" : "Approved"}
                                  </Typography>
                                  {u && <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", mt: 0.2 }}>{u.name} <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10, backgroundColor: isDeclined ? "#FFEBEE" : "#E8F5E9", color: isDeclined ? "#C62828" : "#2E7D32", fontWeight: 600, ml: 0.5 }} /></Typography>}
                                  {u && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.2 }}>{u.rollNumber}</Typography>}
                                  <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{formatDateTime(fee.approvedOnDate)}</Typography>
                                </Box>
                              </Box>
                            );
                          })()}
                        </Box>
                      </DialogContent>
                      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #F3F4F6" }}>
                        <Button onClick={() => setOpenActivityLogId(null)} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600, fontSize: 12, borderColor: "#D1D5DB", color: "#6B7280", "&:hover": { backgroundColor: "#F9FAFB" } }}>
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>
                </Box>

                {/* Card body */}
                <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                  {/* Trip info */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", px: 2, py: 1.2 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <DirectionsBusIcon sx={{ fontSize: 20, color: "#2563EB" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>{fee.tripName}</Typography>
                      <Box sx={{ display: "flex", gap: 0.8, mt: 0.5, flexWrap: "wrap" }}>
                        {(() => {
                          const c = tripTypeChip(fee.tripType);
                          return (
                            <Chip
                              label={fee.tripType?.charAt(0).toUpperCase() + fee.tripType?.slice(1)}
                              size="small"
                              icon={c.icon}
                              sx={{ bgcolor: c.bgcolor, color: c.color, fontWeight: 600, fontSize: "11px", height: "20px", border: c.border }}
                            />
                          );
                        })()}
                        <Chip
                          label={fee.tripSlot?.charAt(0).toUpperCase() + fee.tripSlot?.slice(1)}
                          size="small"
                          sx={{ bgcolor: "#F8FAFC", color: "#334155", fontWeight: 600, fontSize: "11px", height: "20px", border: "1px solid #E2E8F0" }}
                        />
                        <Chip
                          label={fee.year}
                          size="small"
                          sx={{ bgcolor: "#F5F3FF", color: "#6D28D9", fontWeight: 600, fontSize: "11px", height: "20px", border: "1px solid #DDD6FE" }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Expand/Collapse stops */}
                  <Box
                    onClick={() => toggleExpand(fee.routeInformationId)}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", px: 1.5, py: 1, borderRadius: "8px", bgcolor: "#F8FAFC", border: "1px solid #E8E8E8", mb: expandedCards[fee.routeInformationId] ? 1.5 : 0, transition: "all 0.2s", "&:hover": { bgcolor: "#EFF6FF", borderColor: "#BFDBFE" } }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FmdGoodIcon sx={{ fontSize: 16, color: "#2563EB", mr: 1 }} />
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>Stop-wise Grade Fees</Typography>
                      <Chip label={`${fee.stops?.length || 0} Stops`} size="small" sx={{ ml: 1.5, height: "20px", fontSize: "11px", fontWeight: 600, bgcolor: "#E0F2FE", color: "#0369A1", border: "1px solid #BAE6FD" }} />
                    </Box>
                    <IconButton size="small" sx={{ transform: expandedCards[fee.routeInformationId] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", bgcolor: "#FFFFFF", border: "1px solid #E8E8E8", width: 28, height: 28, "&:hover": { bgcolor: "#EFF6FF" } }}>
                      <ExpandMoreIcon sx={{ fontSize: 18, color: "#2563EB" }} />
                    </IconButton>
                  </Box>

                  {/* Stops table */}
                  {expandedCards[fee.routeInformationId] && fee.stops && fee.stops.map((stop, index) => (
                    <Box key={index} sx={{ mb: 1.5 }}>
                      <Box sx={{ bgcolor: "#F8FAFC", px: 2, py: 1, borderRadius: "8px 8px 0 0", border: "1px solid #E8E8E8", borderBottom: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                            {index + 1}
                          </Box>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{stop.stopPlace}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarMonthIcon sx={{ fontSize: 13, color: "#64748B" }} />
                          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a" }}>{formatDate(stop.dueDate)}</Typography>
                        </Box>
                      </Box>
                      <TableContainer sx={{ border: "1px solid #E8E8E8", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {Object.keys(stop.grades).map((gradeKey) => (
                                <TableCell key={gradeKey} align="center" sx={{ bgcolor: "#FAFAFA", borderRight: "1px solid #E8E8E8", fontSize: "12px", fontWeight: 600, color: "#64748B", py: 1 }}>
                                  {gradeKey}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              {Object.entries(stop.grades).map(([gradeKey, amount]) => (
                                <TableCell key={gradeKey} align="center" sx={{ borderRight: "1px solid #E8E8E8", fontSize: "13px", fontWeight: 700, color: "#2563EB", py: 1.5 }}>
                                  ₹{amount}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "10px" } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography fontSize={14}>Are you sure you want to delete this transport fee? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: "999px" }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small" sx={{ textTransform: "none", borderRadius: "999px", boxShadow: "none" }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
