import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
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
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
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
                            requestFor: fee.requestFor,
                            editedBy: fee.editedBy,
                            editedOnDate: fee.editedOnDate,
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

    const parseUser = (str) => {
        if (!str) return { rollNumber: '', name: '-', role: '' };
        const parts = str.split('-');
        return {
            rollNumber: parts[0] || '',
            name: parts[1] || str,
            role: parts[2] || '',
        };
    };

    const getRequestBadge = (requestFor) => {
        if (requestFor === 'edit')
            return { label: 'Requested for Edit', bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' };
        if (requestFor === 'delete')
            return { label: 'Requested for Delete', bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
        return { label: 'Requested for New', bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
    };

    const getRollFromString = (str) => {
        if (!str) return '';
        const idx = str.indexOf('-');
        return idx !== -1 ? str.substring(0, idx) : str;
    };

    const pendingFees = groupedFees.filter(fee => fee.status === "Requested" && getRollFromString(fee.requestedBy) !== String(rollNumber));

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd" }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <IconButton
                            onClick={() => navigate("/dashboardmenu/approvals", { state: { tabIndex } })}
                            sx={{ width: "27px", height: "27px", mt: "3px", mr: 1 }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Transport Fee Approval</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: "end" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: 2 }}>
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
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Main Content */}
            <Box sx={{ px: 2 }}>
                {pendingFees.length === 0 ? (
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "77vh",
                        textAlign: "center",
                    }}>
                        <img src={NoData} alt="No data" style={{ width: "30%", marginBottom: 16 }} />
                        <Typography sx={{ color: "#777", fontWeight: 500 }}>No pending transport fee approvals</Typography>
                    </Box>
                ) : (
                    <Grid container sx={{ pb: 2 }}>
                        {pendingFees.map((fee) => (
                            <Grid key={fee.routeInformationId} size={{ lg: 12, md: 8 }}>
                                {/* Tab row */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                                    <Box sx={{ display: "flex", alignItems: "end" }}>
                                        <Box sx={{
                                            bgcolor: "#2563EB",
                                            color: "#fff",
                                            fontSize: "13px",
                                            px: 3,
                                            py: 0.2,
                                            ml: "15px",
                                            fontWeight: 600,
                                            borderTopLeftRadius: "7px",
                                            borderTopRightRadius: "7px",
                                            width: "fit-content",
                                            height: "20px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.8,
                                        }}>
                                            <DirectionsBusIcon sx={{ fontSize: 14 }} />
                                            {fee.tripName}
                                        </Box>

                                        {/* requestFor badge */}
                                        {fee.requestFor && fee.requestFor !== 'Approved' && (() => {
                                            const badge = getRequestBadge(fee.requestFor);
                                            return (
                                                <Chip
                                                    label={badge.label}
                                                    size="small"
                                                    sx={{
                                                        ml: 1.5,
                                                        height: 22,
                                                        fontSize: '11.5px',
                                                        fontWeight: 600,
                                                        bgcolor: badge.bgcolor,
                                                        color: badge.color,
                                                        border: badge.border,
                                                        borderRadius: '6px',
                                                    }}
                                                />
                                            );
                                        })()}
                                    </Box>

                                    {/* Created By */}
                                    <Box sx={{ color: "#000", fontSize: "13px", mt: "30px", px: 3, py: 0.2, ml: "15px", fontWeight: 600, borderTopLeftRadius: "7px", borderTopRightRadius: "7px", width: "fit-content" }}>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                                            <span style={{ fontSize: "12px", color: "#777", fontWeight: 500 }}>Requested By : </span>
                                            {parseUser(fee.requestedBy).name} - {parseUser(fee.requestedBy).rollNumber}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Card body */}
                                <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>

                                    {/* Info chips row */}
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                                        <Chip
                                            label={fee.tripType?.charAt(0).toUpperCase() + fee.tripType?.slice(1)}
                                            size="small"
                                            icon={
                                                fee.tripType?.toLowerCase() === 'pickup'
                                                    ? <AirportShuttleIcon sx={{ fontSize: 14 }} />
                                                    : fee.tripType?.toLowerCase() === 'drop'
                                                        ? <HomeIcon sx={{ fontSize: 14 }} />
                                                        : <SyncAltIcon sx={{ fontSize: 14 }} />
                                            }
                                            sx={{ bgcolor: "#EEF4FF", color: "#1D4ED8", border: "1px solid #C7D7FE", fontWeight: 600, fontSize: "12px" }}
                                        />
                                        <Chip
                                            label={fee.tripSlot?.charAt(0).toUpperCase() + fee.tripSlot?.slice(1)}
                                            size="small"
                                            sx={{ bgcolor: "#F8FAFC", color: "#334155", border: "1px solid #E2E8F0", fontWeight: 600, fontSize: "12px" }}
                                        />
                                        <Chip
                                            label={`Year: ${fee.year}`}
                                            size="small"
                                            sx={{ bgcolor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontWeight: 600, fontSize: "12px" }}
                                        />
                                        <Chip
                                            label={`${fee.stops?.length || 0} Stops`}
                                            size="small"
                                            icon={<FmdGoodIcon sx={{ fontSize: 14 }} />}
                                            sx={{ bgcolor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA", fontWeight: 600, fontSize: "12px" }}
                                        />
                                    </Box>

                                    {/* Stops table */}
                                    <TableContainer sx={{ border: "1px solid #E8DDEA", backgroundColor: "#fff", boxShadow: "none", borderRadius: "5px" }}>
                                        <Table stickyHeader aria-label="stops table" sx={{ minWidth: '100%' }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#f0f4ff", fontWeight: 600, fontSize: "13px" }}>S.No</TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#f0f4ff", fontWeight: 600, fontSize: "13px" }}>Stop Name</TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#f0f4ff", fontWeight: 600, fontSize: "13px" }}>Due Date</TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#f0f4ff", fontWeight: 600, fontSize: "13px" }}>Grades & Fees</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {fee.stops?.map((stop, index) => (
                                                    <TableRow key={stop.id || index}>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontWeight: 600 }}>{stop.stopPlace}</TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>{formatDate(stop.dueDate)}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, justifyContent: "center" }}>
                                                                {stop.grades && Object.entries(stop.grades).map(([gradeKey, amount]) => (
                                                                    <Chip
                                                                        key={gradeKey}
                                                                        label={`${gradeKey}: ₹${amount}`}
                                                                        size="small"
                                                                        sx={{ bgcolor: "#EEF4FF", color: "#1D4ED8", border: "1px solid #C7D7FE", fontSize: "11px", fontWeight: 600 }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {/* Action buttons */}
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3, pt: 2, borderTop: "1px solid #E8DDEA" }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleViewDetails(fee)}
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderRadius: "999px",
                                                height: 28,
                                                borderColor: "#2563EB",
                                                color: "#2563EB",
                                                fontSize: "13px",
                                                "&:hover": { borderColor: "#1D4ED8", bgcolor: "#EEF4FF" }
                                            }}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleRejectClick(fee)}
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderRadius: "999px",
                                                height: 28,
                                                fontSize: "13px",
                                                boxShadow: "none",
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
                                                borderRadius: "999px",
                                                height: 28,
                                                fontSize: "13px",
                                                boxShadow: "none",
                                            }}
                                        >
                                            Accept
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* View Details Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, fontSize: "16px", borderBottom: "1px solid #E8DDEA", display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <DirectionsBusIcon sx={{ color: "#2563EB", fontSize: 22 }} />
                        Transport Fee Details — {selectedFee?.tripName} · {selectedFee?.year}
                    </Box>
                    <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {selectedFee && (
                        <Box>
                            {/* Summary chips */}
                            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E8DDEA", display: "flex", flexWrap: "wrap", gap: 1 }}>
                                <Chip
                                    label={`Trip Type: ${selectedFee.tripType?.charAt(0).toUpperCase() + selectedFee.tripType?.slice(1)}`}
                                    size="small"
                                    sx={{ bgcolor: "#EEF4FF", color: "#1D4ED8", border: "1px solid #C7D7FE", fontWeight: 600 }}
                                />
                                <Chip
                                    label={`Slot: ${selectedFee.tripSlot?.charAt(0).toUpperCase() + selectedFee.tripSlot?.slice(1)}`}
                                    size="small"
                                    sx={{ bgcolor: "#F8FAFC", color: "#334155", border: "1px solid #E2E8F0", fontWeight: 600 }}
                                />
                                <Chip
                                    label={`Year: ${selectedFee.year}`}
                                    size="small"
                                    sx={{ bgcolor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontWeight: 600 }}
                                />
                                <Chip
                                    label={`${selectedFee.stops?.length || 0} Total Stops`}
                                    size="small"
                                    icon={<FmdGoodIcon sx={{ fontSize: 14 }} />}
                                    sx={{ bgcolor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA", fontWeight: 600 }}
                                />
                            </Box>

                            {/* Stop-wise table */}
                            <Box sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#333", mb: 1.5 }}>
                                    Stop-wise Grade Fees
                                </Typography>
                                {selectedFee.stops && selectedFee.stops.map((stop, index) => (
                                    <Box key={index} sx={{ mb: 2, border: "1px solid #E8DDEA", borderRadius: "5px", overflow: "hidden" }}>
                                        {/* Stop header */}
                                        <Box sx={{ bgcolor: "#f0f4ff", px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E8DDEA" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                                                    {index + 1}
                                                </Box>
                                                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>{stop.stopPlace}</Typography>
                                                <Typography sx={{ fontSize: "11px", color: "#64748B" }}>Stop {index + 1} of {selectedFee.stops.length}</Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <CalendarMonthIcon sx={{ fontSize: 13, color: "#64748B" }} />
                                                <Typography sx={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>{formatDate(stop.dueDate)}</Typography>
                                            </Box>
                                        </Box>
                                        {/* Grade fees */}
                                        <Box sx={{ p: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            {stop.grades && Object.entries(stop.grades).map(([gradeKey, amount]) => (
                                                <Chip
                                                    key={gradeKey}
                                                    label={`${gradeKey}: ₹${amount}`}
                                                    size="small"
                                                    sx={{ bgcolor: "#EEF4FF", color: "#1D4ED8", border: "1px solid #C7D7FE", fontSize: "12px", fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Footer */}
                            <Box sx={{ bgcolor: "#fafafa", px: 3, py: 1.5, borderTop: "1px solid #E8DDEA" }}>
                                <Typography sx={{ fontSize: "12px", color: "#777", fontWeight: 500 }}>
                                    Created By : <span style={{ fontWeight: 600, color: "#333" }}>{parseUser(selectedFee.createdBy).name}</span>
                                    <span style={{ marginLeft: 8, color: "#999" }}>{formatDateTime(selectedFee.createdOn)}</span>
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #E8DDEA" }}>
                    <Button
                        onClick={() => setOpenViewDialog(false)}
                        variant="outlined"
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", height: 28, borderColor: "#ccc", color: "#555" }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, borderBottom: "1px solid #eee" }}>
                    Reject Transport Fee Approval
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: "13px", color: "#555", mb: 1 }}>
                        Are you sure you want to reject transport fee for <strong>{selectedFee?.tripName}</strong>?
                        This will reject all {selectedFee?.stops?.length || 0} stop(s).
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#555", mb: 1, mt: 2 }}>
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
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "14px" } }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #eee", gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setOpenRejectDialog(false);
                            setRejectReason("");
                            setRejectError(false);
                        }}
                        sx={{ textTransform: "none", fontWeight: 600, borderColor: "#ccc", color: "#555", height: "28px", borderRadius: "999px" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRejectConfirm}
                        sx={{ textTransform: "none", fontWeight: 600, height: "28px", borderRadius: "999px", boxShadow: "none" }}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
