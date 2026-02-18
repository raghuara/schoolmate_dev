import { Autocomplete, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import NoData from '../../../../Images/Login/No Data.png';
import { approvalStatusCheckTranspoart, updateTranspoartFeesApprovalAction } from "../../../../Api/Api";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import dayjs from 'dayjs';

export default function TransportFeeApprovalPage() {
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
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState(false);

    const academicYears = [
        `${currentYear - 2}-${currentYear - 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
    ];

    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    useEffect(() => {
        fetchApprovalData();
    }, [selectedYear]);

    const fetchApprovalData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(approvalStatusCheckTranspoart, {
                params: {
                    RollNumber: rollNumber,
                    Year: selectedYear,
                    Status: "Requested"
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
                            stops: []
                        };
                    }
                    acc[routeId].stops.push(fee);
                    return acc;
                }, {});
                setGroupedFees(Object.values(grouped));
            }
        } catch (error) {
            console.error("Error fetching approval data:", error);
            setMessage("Failed to load approval data");
            setColor(false);
            setStatus(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (feeIds, action) => {
        setIsLoading(true);
        try {
            const promises = feeIds.map(id =>
                axios.put(
                    updateTranspoartFeesApprovalAction,
                    null,
                    {
                        params: {
                            transpoartFeesID: id,
                            RollNumber: rollNumber,
                            Action: action,
                            Reason: action === "accept" ? "" : (rejectReason || "")
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
            );

            await Promise.all(promises);

            setMessage(
                action === "accept"
                    ? "Transport fees approved successfully"
                    : "Transport fees rejected successfully"
            );
            setColor(true);
            setStatus(true);
            setOpen(true);

            // Close dialogs and refresh
            setOpenRejectDialog(false);
            setRejectReason("");
            setRejectError(false);
            fetchApprovalData();
        } catch (error) {
            console.error("Approval action error:", error);
            setMessage(error?.response?.data?.message || "Action failed. Please try again");
            setColor(false);
            setStatus(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectClick = (fee) => {
        setSelectedFee(fee);
        setRejectReason("");
        setRejectError(false);
        setOpenRejectDialog(true);
    };

    const handleRejectConfirm = () => {
        if (!rejectReason.trim()) {
            setRejectError(true);
            return;
        }
        const feeIds = selectedFee.stops.map(stop => stop.id);
        handleApproval(feeIds, "decline");
    };

    const handleAccept = (fee) => {
        const feeIds = fee.stops.map(stop => stop.id);
        handleApproval(feeIds, "accept");
    };

    const handleViewDetails = (fee) => {
        setSelectedFee(fee);
        setOpenViewDialog(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dayjs(dateString).format('DD-MM-YYYY');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        return dayjs(dateString).format('DD-MM-YYYY hh:mm A');
    };

    // Filter out approved/rejected if needed
    const pendingFees = groupedFees.filter(fee => fee.status === "Requested");

    return (
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
                        <IconButton
                            onClick={() => navigate("/dashboardmenu/approvals", { state: { tabIndex } })}
                            sx={{
                                width: "32px",
                                height: "32px",
                                mr: 1,
                                "&:hover": { bgcolor: "#f5f5f5" }
                            }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#333" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "18px", color: "#333" }}>
                            Transport Fee Approval
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, mt: { xs: 1, md: 0 } }}>
                        <Autocomplete
                            size="small"
                            options={academicYears}
                            value={selectedYear}
                            onChange={(e, newValue) => setSelectedYear(newValue)}
                            sx={{ width: 180 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Academic Year"
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: 36,
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            borderRadius: "6px",
                                            backgroundColor: "#fff",
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
                {pendingFees.length === 0 ? (
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "77vh",
                        textAlign: "center",
                    }}>
                        <img
                            src={NoData}
                            alt="No data"
                            style={{
                                width: "30%",
                                height: "auto",
                                marginBottom: "16px",
                            }}
                        />
                        <Typography sx={{ fontSize: "16px", color: "#666", fontWeight: 600 }}>
                            No Pending Transport Fee Approvals
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2.5}>
                        {pendingFees.map((fee) => (
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
                                        bgcolor: "#FAFAFA",
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
                                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                                                    bgcolor: "#FEF3F3",
                                                    borderRadius: "12px",
                                                    p: 1.5,
                                                    border: "1px solid #FEE2E2"
                                                }}>
                                                    <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600 }}>
                                                        STATUS
                                                    </Typography>
                                                    <Chip
                                                        label={fee.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#FFF3E0",
                                                            color: "#FF9800",
                                                            fontWeight: 600,
                                                            fontSize: "11px",
                                                            height: "22px",
                                                            border: "1px solid #FFE0B2"
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Stops Summary */}
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#333", mb: 1.5 }}>
                                            <FmdGoodIcon sx={{ fontSize: 16, color: "#667eea", mr: 0.5, verticalAlign: "middle" }} />
                                            Bus Stops ({fee.stops?.length})
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
                                            {fee.stops?.slice(0, 5).map((stop, index) => (
                                                <Chip
                                                    key={index}
                                                    label={stop.stopPlace}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#E8F5E9",
                                                        color: "#2E7D32",
                                                        fontWeight: 600,
                                                        fontSize: "12px"
                                                    }}
                                                />
                                            ))}
                                            {fee.stops?.length > 5 && (
                                                <Chip
                                                    label={`+${fee.stops.length - 5} more`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#E3F2FD",
                                                        color: "#1976d2",
                                                        fontWeight: 600,
                                                        fontSize: "12px"
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 1.5,
                                            pt: 1.5,
                                            borderTop: "1px solid #E8E8E8"
                                        }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(fee)}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    borderRadius: "30px",
                                                    height: 36,
                                                    borderColor: "#667eea",
                                                    color: "#667eea",
                                                    "&:hover": {
                                                        borderColor: "#5568d3",
                                                        bgcolor: "#f5f7ff"
                                                    }
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<CancelIcon />}
                                                onClick={() => handleRejectClick(fee)}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    borderRadius: "30px",
                                                    height: 36,
                                                    boxShadow: "none",
                                                    "&:hover": {
                                                        boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)"
                                                    }
                                                }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => handleAccept(fee)}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    borderRadius: "30px",
                                                    height: 36,
                                                    px: 3,
                                                    boxShadow: "none",
                                                    "&:hover": {
                                                        boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)"
                                                    }
                                                }}
                                            >
                                                Accept
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* View Details Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: "#FAFAFA",
                    borderBottom: "1px solid #E8E8E8",
                    py: 2,
                    px: 3
                }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "14px",
                                bgcolor: "#F0F9FF",
                                border: "1px solid #E0F2FE",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <DirectionsBusIcon sx={{ fontSize: 24, color: "#2563EB" }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", mb: 0.3 }}>
                                    Transport Fee Details
                                </Typography>
                                <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
                                    {selectedFee?.tripName} • {selectedFee?.year}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={() => setOpenViewDialog(false)}
                            sx={{
                                color: "#64748B",
                                bgcolor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                borderRadius: "10px",
                                "&:hover": { bgcolor: "#E2E8F0" }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: "#F8FAFC" }}>
                    {selectedFee && (
                        <Box>
                            {/* Summary Cards */}
                            <Box sx={{ bgcolor: "#FFFFFF", px: 3, py: 2, borderBottom: "1px solid #E8E8E8" }}>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            bgcolor: "#F0F9FF",
                                            borderRadius: "12px",
                                            p: 1.5,
                                            border: "1px solid #E0F2FE"
                                        }}>
                                            <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                                                Trip Type
                                            </Typography>
                                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                                                {selectedFee.tripType?.charAt(0).toUpperCase() + selectedFee.tripType?.slice(1)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            bgcolor: "#F8FAFC",
                                            borderRadius: "12px",
                                            p: 1.5,
                                            border: "1px solid #E2E8F0"
                                        }}>
                                            <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                                                Trip Slot
                                            </Typography>
                                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                                                {selectedFee.tripSlot?.charAt(0).toUpperCase() + selectedFee.tripSlot?.slice(1)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            bgcolor: "#F0FDF4",
                                            borderRadius: "12px",
                                            p: 1.5,
                                            border: "1px solid #DCFCE7"
                                        }}>
                                            <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                                                Academic Year
                                            </Typography>
                                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                                                {selectedFee.year}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            bgcolor: "#FEF3F3",
                                            borderRadius: "12px",
                                            p: 1.5,
                                            border: "1px solid #FEE2E2"
                                        }}>
                                            <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>
                                                Total Stops
                                            </Typography>
                                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                                                {selectedFee.stops?.length || 0} Stops
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Stops Detail */}
                            <Box sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", mb: 2 }}>
                                    Stop-wise Grade Fees
                                </Typography>

                                {selectedFee.stops && selectedFee.stops.map((stop, index) => (
                                    <Card key={index} sx={{
                                        mb: 2,
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                        borderRadius: "14px",
                                        border: "1px solid #E8E8E8",
                                        overflow: "hidden"
                                    }}>
                                        {/* Stop Header */}
                                        <Box sx={{
                                            bgcolor: "#F8FAFC",
                                            px: 2,
                                            py: 1.5,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            borderBottom: "1px solid #E8E8E8"
                                        }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "10px",
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
                                                <Box>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                                                        {stop.stopPlace}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#64748B" }}>
                                                        Stop {index + 1} of {selectedFee.stops.length}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: "right" }}>
                                                <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.25 }}>
                                                    <CalendarMonthIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                                                    Due Date
                                                </Typography>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>
                                                    {formatDate(stop.dueDate)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ p: 2 }}>
                                            {/* Grade Fees Grid */}
                                            <Grid container spacing={1.5}>
                                                {Object.entries(stop.grades).map(([gradeKey, amount]) => (
                                                    <Grid
                                                        key={gradeKey}
                                                        size={{
                                                            xs: 6,
                                                            sm: 4,
                                                            md: 3,
                                                            lg: 2
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                bgcolor: "#FAFAFA",
                                                                border: "1px solid #E2E8F0",
                                                                borderRadius: "12px",
                                                                p: 1.5,
                                                                textAlign: "center",
                                                                transition: "all 0.2s",
                                                                "&:hover": {
                                                                    transform: "translateY(-2px)",
                                                                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.1)",
                                                                    borderColor: "#2563EB",
                                                                    bgcolor: "#F0F9FF"
                                                                }
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontSize: "11px",
                                                                    fontWeight: 600,
                                                                    color: "#64748B",
                                                                    mb: 0.5,
                                                                    textTransform: "uppercase"
                                                                }}
                                                            >
                                                                {gradeKey}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: "15px",
                                                                    fontWeight: 700,
                                                                    color: "#2563EB"
                                                                }}
                                                            >
                                                                ₹{amount}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>

                            {/* Footer Info */}
                            <Box sx={{
                                bgcolor: "#FAFAFA",
                                px: 3,
                                py: 1.5,
                                borderTop: "1px solid #E8E8E8",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <Box>
                                    <Typography sx={{ fontSize: "11px", color: "#64748B", mb: 0.25 }}>
                                        Created By
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>
                                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#16A34A", display: "inline-block", mr: 1 }} />
                                        {selectedFee.createdBy}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#64748B" }}>
                                        {formatDateTime(selectedFee.createdOn)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, bgcolor: "#FFFFFF", borderTop: "1px solid #E8E8E8" }}>
                    <Button
                        onClick={() => setOpenViewDialog(false)}
                        sx={{
                            textTransform: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#64748B",
                            borderRadius: "10px",
                            px: 3,
                            py: 1,
                            "&:hover": { bgcolor: "#F8FAFC" }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={openRejectDialog}
                onClose={() => setOpenRejectDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "18px",
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
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "rgba(198, 40, 40, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <CancelIcon sx={{ fontSize: 24, color: "#c62828" }} />
                    </Box>
                    <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                        Reject Transport Fee Approval
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ py: 3, px: 3 }}>
                    <Typography sx={{ fontSize: "15px", color: "#333", mb: 2, lineHeight: 1.6 }}>
                        Are you sure you want to reject the transport fee structure for <strong>{selectedFee?.tripName}</strong>?
                    </Typography>

                    <Box sx={{
                        bgcolor: "#FFF3E0",
                        border: "1px solid #FFE0B2",
                        borderRadius: "12px",
                        p: 2,
                        mb: 2
                    }}>
                        <Typography sx={{ fontSize: "13px", color: "#E65100", fontWeight: 600, mb: 1 }}>
                            ⚠️ This action will reject all {selectedFee?.stops?.length || 0} stop(s)
                        </Typography>
                    </Box>

                    <Typography sx={{ fontSize: "13px", color: "#555", mb: 1 }}>
                        Please provide a reason for rejection <span style={{ color: "#D32F2F" }}>*</span>
                    </Typography>

                    <TextField
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Enter rejection reason"
                        value={rejectReason}
                        onChange={(e) => {
                            setRejectReason(e.target.value);
                            setRejectError(false);
                        }}
                        error={rejectError}
                        helperText={rejectError ? "Rejection reason is required" : ""}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                fontSize: "14px",
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, bgcolor: "#FAFAFA", borderTop: "1px solid #E8E8E8" }}>
                    <Button
                        onClick={() => {
                            setOpenRejectDialog(false);
                            setRejectReason("");
                            setRejectError(false);
                        }}
                        sx={{
                            textTransform: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#64748B",
                            borderRadius: "10px",
                            px: 3,
                            py: 1,
                            "&:hover": { bgcolor: "#F8FAFC" }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectConfirm}
                        variant="contained"
                        startIcon={<CancelIcon />}
                        sx={{
                            textTransform: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            bgcolor: "#DC2626",
                            borderRadius: "10px",
                            px: 3,
                            py: 1,
                            "&:hover": { bgcolor: "#B91C1C" }
                        }}
                    >
                        Reject Fee Structure
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
