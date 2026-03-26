import { Autocomplete, Box, Button, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, Paper, Popper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import { additionalFeeFetch, approvalStatusCheck, approvalStatusCheckAdditional, approvalStatusCheckEca, deleteAdditionalFeesStructure, deleteEcaFeesStructure, deleteSchoolFeesStructure, ecaFeeFetch } from "../../../../Api/Api";
import NoData from '../../../../Images/Login/No Data.png';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';


export default function ExtraCurricularFeeApprovalStatus() {

  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber;
  const userType = user.userType;

  const token = "123";
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate()
  const location = useLocation();
  const tabIndex = location.state?.tabIndex ?? 1;

  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [selectedClass, setSelectedClass] = useState("Prekg");

  const websiteSettings = useSelector(selectWebsiteSettings)
  const [openReason, setOpenReason] = useState(false);

  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeSign, setSelectedGradeSign] = useState(null);

  const [details, setDetails] = useState([]);
  const [feesData, setFeesData] = useState([]);

  const [openReasonId, setOpenReasonId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openActivityLogId, setOpenActivityLogId] = useState(null);

  const isExpanded = useSelector((state) => state.sidebar.isExpanded);

  const statusOptions = [
    { label: "All", value: null },
    { label: "Pending", value: "Requested" },
    { label: "Rejected", value: "Declined" },
    { label: "Approved", value: "Approved" }
  ];

  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);

  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} at ${hours}:${mins}`;
  };

  const getRequestBadge = (requestFor) => {
    if (requestFor === 'edit')
      return { label: 'Requested for Edit', bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' };
    if (requestFor === 'delete')
      return { label: 'Requested for Delete', bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
    return { label: 'Requested for New', bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
  };

  // Parses "919160-DivyaSharma-admin" → { rollNumber, name, role }
  const parseUser = (str) => {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length >= 3) {
      return { rollNumber: parts[0], name: parts[1], role: parts[2] };
    }
    return { rollNumber: "", name: str, role: "" };
  };

  useEffect(() => {
    fetchStatusDetails()
  }, [selectedYear, selectedStatus]);

  const fetchStatusDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(approvalStatusCheckEca, {
        params: {
          RollNumber: rollNumber,
          Year: selectedYear,
          Status: selectedStatus?.value,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDetails(res.data.fees)
    } catch (error) {
      console.error("Error while inserting data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredFees = selectedGradeSign
    ? feesData.filter((item) => item.grade === selectedGradeSign)
    : feesData;

  const showNoData =
    !feesData.length ||
    !filteredFees.some(item => item.fees && item.fees.length > 0);


  const handleDelete = async () => {
    if (!deleteId) return;

    setIsLoading(true);
    try {
      const res = await axios.delete(deleteEcaFeesStructure, {
        params: {
          ecaFeesID: deleteId,
          RollNumber: rollNumber,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchStatusDetails()
      setOpenDeleteDialog(false)
      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage("Deleted Successfully");
    } catch (error) {
      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage("Failed to delete . Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", }}>
      <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
      {isLoading && <Loader />}
      <Box sx={{
        position: "fixed",
        top: "60px",
        left: isExpanded ? "260px" : "80px",
        right: 0,
        backgroundColor: "#f2f2f2",
        px: 2,
        borderBottom: "1px solid #ddd",
        zIndex: 1200,
        transition: "left 0.3s ease-in-out",
        overflow: 'hidden',
      }}>

        <Grid container>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
            <IconButton
              onClick={() =>
                navigate("/dashboardmenu/status", {
                  state: { tabIndex },
                })
              }
              sx={{ width: "27px", height: "27px", mt: "3px" }}
            >
              <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
            </IconButton>

            <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >ECA Fee Approval Status</Typography>
          </Grid>
          <Grid
            size={{ xs: 0, sm: 0, md: 0, lg: 2 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 4 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <Autocomplete
              value={selectedStatus}
              sx={{ width: "160px", mr: 1.5 }}
              options={statusOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value?.value
              }
              onChange={(event, newValue) => {
                setSelectedStatus(newValue || statusOptions[0]);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 35,
                      fontSize: '14px'
                    }
                  }}
                />
              )}
            />


            <Autocomplete
              size="small"
              options={academicYears}
              sx={{ width: "170px", }}
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
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Box sx={{ px: 2, pt: "60px" }}>
          {/* {showNoData && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "77vh",
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
                        </Box>
                    )} */}
          <Grid container sx={{ pb: 2 }}>
            {
              details.map((item) => (
                <Grid key={item} size={{ lg: 12, md: 8, }} sx={{pt:2}}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                    <Box sx={{ display: "flex", alignItems: "end" }}>

                      {item.status === "Requested" &&
                        <Box
                          sx={{
                            ml: 0.5,
                            height: 22,
                            px: 1.6,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                            borderTopLeftRadius: "7px",
                            borderTopRightRadius: "7px",
                            backgroundColor: "#E65100",
                            border: "1px solid #E65100",
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#fff",
                              lineHeight: 1,
                            }}
                          >
                            Pending
                          </Typography>
                        </Box>
                      }
                      {item.status === "Declined" &&
                        <Box
                          sx={{
                            ml: 1,
                            height: 22,
                            px: 1.6,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                            borderTopLeftRadius: "7px",
                            borderTopRightRadius: "7px",
                            backgroundColor: "#B71C1C",
                            border: "1px solid #B71C1C",
                          }}
                        >
                          <Box

                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#fff",
                              lineHeight: 1,
                            }}
                          >
                            Rejected
                          </Typography>
                        </Box>
                      }

                      {item.status === "Approved" &&
                        <Box
                          sx={{
                            ml: 1,
                            height: 22,
                            px: 1.6,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                            borderTopLeftRadius: "7px",
                            borderTopRightRadius: "7px",
                            backgroundColor: "#1B5E20",
                            border: "1px solid #1B5E20",
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#fff",
                              lineHeight: 1,
                            }}
                          >
                            Approved
                          </Typography>
                        </Box>
                      }
                      {item.status === "Declined" &&
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setOpenReasonId(item.id)}
                          sx={{
                            textTransform: "none",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#555",
                            borderColor: "#ccc",
                            height: 24,
                            px: 1.2,
                            ml: 1,
                            minWidth: "auto",
                            borderRadius: "6px",
                            "&:hover": {
                              backgroundColor: "#FDECEA",
                              borderColor: "#555",
                            },
                          }}
                        >
                          View reason
                        </Button>
                      }
                      <Dialog
                        open={openReasonId === item.id}
                        onClose={() => setOpenReasonId(null)}
                        maxWidth="sm"
                        fullWidth
                      >

                        <DialogTitle
                          sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          Rejection Reason
                        </DialogTitle>

                        <DialogContent dividers>
                          <Box
                            sx={{
                              backgroundColor: "#FFF5F5",
                              border: "1px solid #F5A5A0",
                              borderRadius: "8px",
                              p: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "13px",
                                color: "#B71C1C",
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              Reason
                            </Typography>

                            <Typography sx={{ fontSize: "14px", color: "#333" }}>
                              {item.reason || ""}
                            </Typography>
                          </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2 }}>
                          <Button
                            onClick={() => setOpenReasonId(null)}
                            variant="outlined"
                            sx={{ textTransform: "none" }}
                          >
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>

                      {item.status === "Declined" &&
                        <IconButton
                          sx={{
                            width: 25,
                            height: 25,
                            ml: 1,
                            "&:hover .MuiSvgIcon-root": {
                              color: "red",
                            },
                          }}
                          onClick={() => {
                            setDeleteId(item.id);
                            setOpenDeleteDialog(true);
                          }}

                        >
                          <DeleteIcon
                            sx={{
                              fontSize: "20px",
                              color: "#FF00009A",
                              transition: "color 0.2s ease",
                            }}
                          />
                        </IconButton>
                      }

                      {/* requestFor badge */}
                      {item.requestFor && item.requestFor !== 'Approved' && (() => {
                        const badge = getRequestBadge(item.requestFor);
                        return (
                          <Chip
                            label={badge.label}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 22,
                              fontSize: '11.5px',
                              fontWeight: 600,
                              bgcolor: badge.bgcolor,
                              color: badge.color,
                              border: badge.border,
                              borderRadius: '6px 6px 0 0',
                            }}
                          />
                        );
                      })()}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {(() => {
                        const creator = parseUser(item.createdBy);
                        return creator ? (
                          <Typography sx={{ fontSize: "11px", color: "#777" }}>
                            By <span style={{ fontWeight: 600, color: "#444" }}>{creator.name}</span>
                            {" · "}{formatDate(item.createdOn)}
                          </Typography>
                        ) : null;
                      })()}
                      <Tooltip title="View activity log" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => setOpenActivityLogId(item.id)}
                          sx={{ width: 22, height: 22, color: "#9CA3AF", "&:hover": { color: "#7B1FA2", backgroundColor: "#F3E5F5" } }}
                        >
                          <InfoOutlinedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>

                      {/* Activity Log Dialog */}
                      <Dialog
                        open={openActivityLogId === item.id}
                        onClose={() => setOpenActivityLogId(null)}
                        maxWidth="xs"
                        fullWidth
                        PaperProps={{ sx: { borderRadius: "12px", overflow: "hidden" } }}
                      >
                        <Box sx={{ px: 2.5, py: 1.8, backgroundColor: "#7B1FA2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                              const u = parseUser(item.createdBy);
                              return (
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#E8F5E9", border: "2px solid #4CAF50", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <AddCircleOutlineIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
                                    </Box>
                                    {(item.editedBy || ((item.approvedBy || item.approvedOnDate) && item.approvedBy !== item.createdBy)) && (
                                      <Box sx={{ width: 2, flex: 1, minHeight: 24, backgroundColor: "#E5E7EB", my: 0.4 }} />
                                    )}
                                  </Box>
                                  <Box sx={{ pb: 2 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>Created</Typography>
                                    {u && <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", mt: 0.2 }}>{u.name} <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10, backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 600, ml: 0.5 }} /></Typography>}
                                    {u && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.2 }}>{u.rollNumber}</Typography>}
                                    <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{formatDateTime(item.createdOn)}</Typography>
                                  </Box>
                                </Box>
                              );
                            })()}

                            {/* Edited — only if editedBy exists */}
                            {item.editedBy && (() => {
                              const u = parseUser(item.editedBy);
                              return (
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#FFF3E0", border: "2px solid #FF9800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <EditOutlinedIcon sx={{ fontSize: 16, color: "#FF9800" }} />
                                    </Box>
                                    {(item.approvedBy || item.approvedOnDate) && item.approvedBy !== item.createdBy && (
                                      <Box sx={{ width: 2, flex: 1, minHeight: 24, backgroundColor: "#E5E7EB", my: 0.4 }} />
                                    )}
                                  </Box>
                                  <Box sx={{ pb: 2 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#E65100" }}>Edited</Typography>
                                    {u && <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", mt: 0.2 }}>{u.name} <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10, backgroundColor: "#FFF3E0", color: "#E65100", fontWeight: 600, ml: 0.5 }} /></Typography>}
                                    {u && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.2 }}>{u.rollNumber}</Typography>}
                                    <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{formatDateTime(item.editedOnDate)}</Typography>
                                  </Box>
                                </Box>
                              );
                            })()}

                            {/* Approved / Declined */}
                            {/* Hide Approved step if the same person who created also approved (e.g. superadmin self-approval) */}
                            {(item.approvedBy || item.approvedOnDate) && item.approvedBy !== item.createdBy && (() => {
                              const u = parseUser(item.approvedBy);
                              const isDeclined = item.status === "Declined";
                              return (
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: isDeclined ? "#FFEBEE" : "#E8F5E9", border: `2px solid ${isDeclined ? "#f44336" : "#4CAF50"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      {isDeclined
                                        ? <CancelOutlinedIcon sx={{ fontSize: 16, color: "#f44336" }} />
                                        : <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
                                      }
                                    </Box>
                                  </Box>
                                  <Box sx={{ pb: 1 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: isDeclined ? "#C62828" : "#2E7D32" }}>
                                      {isDeclined ? "Rejected" : "Approved"}
                                    </Typography>
                                    {u && <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", mt: 0.2 }}>{u.name} <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10, backgroundColor: isDeclined ? "#FFEBEE" : "#E8F5E9", color: isDeclined ? "#C62828" : "#2E7D32", fontWeight: 600, ml: 0.5 }} /></Typography>}
                                    {u && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.2 }}>{u.rollNumber}</Typography>}
                                    <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{formatDateTime(item.approvedOnDate)}</Typography>
                                  </Box>
                                </Box>
                              );
                            })()}

                          </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #F3F4F6" }}>
                          <Button
                            onClick={() => setOpenActivityLogId(null)}
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600, fontSize: 12, borderColor: "#D1D5DB", color: "#6B7280", "&:hover": { backgroundColor: "#F9FAFB" } }}
                          >
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Box>
                  </Box>
                  <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                    <TableContainer
                      sx={{
                        border: "1px solid #E8DDEA",
                        backgroundColor: "#fff",
                        boxShadow: "none",
                        borderBottom: "none"
                      }}
                    >
                      <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                              Fee Name
                            </TableCell>
                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                              Remarks
                            </TableCell>
                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                              Payment Status
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", backgroundColor: "#faf6fc" }}>
                              Due Date
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                              {item.activityName}
                            </TableCell>

                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                              {item.activityCategory}
                            </TableCell>
                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                              {item.paid === "Y" ? "Paid" : "Unpaid"}
                            </TableCell>

                            <TableCell sx={{ textAlign: "center" }}>
                              {formatDate(item.dueDate)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {item.paid === "Y" &&
                      <Box sx={{ backgroundColor: "#FFE5E5", p: 3, border: "1px solid #E8DDEA", borderTop: "none", }}>
                        <Grid container spacing={2}>
                          {Object.entries(item.grades || {}).map(
                            ([gradeKey, amount]) => (
                              <Grid size={{ lg: 1.5 }} key={gradeKey}>
                                <Typography
                                  sx={{
                                    color: "red",
                                    fontSize: "12px",
                                    mb: 0.5,
                                  }}
                                >
                                  {gradeKey.toUpperCase()}
                                </Typography>
                                <Box sx={{ border: "1px solid #0000003A", borderRadius: "5px", height: "30px", backgroundColor: "#F6F6F8", px: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  ₹ {amount}
                                </Box>

                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                    }
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Box>

      </Box>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>

        <DialogContent>
          <Typography fontSize={14}>
            Delete this item?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            size="small"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
}
