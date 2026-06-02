import { Autocomplete, Box, Button, Card, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, FormControlLabel, Grid, IconButton, InputAdornment, Popper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import {
    selectAcademicYear,
    selectAcademicYearOptions,
    setSelectedAcademicYear,
} from "../../../../Redux/Slices/academicYearSlice";
import NoData from '../../../../Images/Login/No Data.png'
import { additionalFeeFetch, updateAdditionalFee, updateAdditionalFeesApprovalAction } from "../../../../Api/Api";

export default function AdditionalFeeApprovalPage() {
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

    
    const selectedYear = useSelector(selectAcademicYear);
    const academicYears = useSelector(selectAcademicYearOptions);
    const [selectedClass, setSelectedClass] = useState("Prekg");

    const websiteSettings = useSelector(selectWebsiteSettings)

    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const [rejectItem, setRejectItem] = useState(null);
    const [editItem, setEditItem] = useState(null);


    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState(false);
    const [editFees, setEditFees] = useState({
        id: null,
        feeName: '',
        remarks: '',
        paid: 'Y',
        dueDate: null,
        gradeAmounts: {},
    });
    const [editRemovedGrades, setEditRemovedGrades] = useState(new Set());

    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [details, setDetails] = useState([]);
    const [selectedFee, setSelectedFee] = useState(null);
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);



    
    const getGradeEntries = (item) => {
        if (item.grades && typeof item.grades === 'object') {
            return Object.entries(item.grades).filter(
                ([, amount]) => amount !== null && amount !== undefined && amount !== ''
            );
        }
        if (grades && grades.length > 0) {
            return grades
                .map((g) => [g.sign, item[g.sign.toLowerCase()]])
                .filter(([, amount]) => amount !== null && amount !== undefined && amount !== '');
        }
        return [];
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const toInputDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
    };

    const getRequestBadge = (requestFor) => {
        if (requestFor === 'edit')
            return { label: 'Requested for Edit', bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' };
        if (requestFor === 'delete')
            return { label: 'Requested for Delete', bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
        return { label: 'Requested for New', bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
    };



    useEffect(() => {
        fetchStatusDetails()
    }, [selectedYear, selectedGradeId]);

    const fetchStatusDetails = async () => {
        if (!selectedYear) return; // wait for the global academic year to load
        setIsLoading(true);
        try {
            const res = await axios.get(additionalFeeFetch, {
                params: {
                    Year: selectedYear,
                    Status: "Requested",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

           
            const data = res.data;
            const list = Array.isArray(data)
                ? data
                : (data?.fees || data?.additionalFees || data?.data || []);
            setDetails(list)
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredDetails = details.filter(item => {
        const requestedBy = item.requestedByRollNumber ?? "";
        return String(requestedBy) !== String(rollNumber);
    });


    const handleSubmit = async (id, action) => {
        setIsLoading(true);

        try {
            const res = await axios.put(
                updateAdditionalFeesApprovalAction,
                null,
                {
                    params: {
                        additionalFeesID: id,
                        RollNumber: rollNumber,
                        Action: action,
                        Reason: rejectReason || ""
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage(
                action === "accept"
                    ? "Approved successfully"
                    : "Rejected successfully"
            );
            fetchStatusDetails()
        } catch (error) {
            console.error("API ERROR:", error?.response || error);

            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage(
                error?.response?.data?.message || "Action failed. Please try again"
            );
        } finally {
            setIsLoading(false);
        }
    };


    const handleEditGradeChange = (gradeSign, value) => {
        if (!/^\d{0,8}$/.test(value)) return;
        const cleaned = value.replace(/^0+(\d)/, '$1');
        setEditFees((prev) => ({
            ...prev,
            gradeAmounts: { ...prev.gradeAmounts, [gradeSign]: cleaned },
        }));
    };

    const handleEditRemoveGrade = (gradeSign) => {
        setEditRemovedGrades((prev) => new Set([...prev, gradeSign]));
        setEditFees((prev) => {
            const newAmounts = { ...prev.gradeAmounts };
            delete newAmounts[gradeSign];
            return { ...prev, gradeAmounts: newAmounts };
        });
    };

    const handleEditRestoreGrade = (gradeSign) => {
        setEditRemovedGrades((prev) => {
            const next = new Set(prev);
            next.delete(gradeSign);
            return next;
        });
    };

    const handleUpdate = async (status) => {

        setIsLoading(true);
        try {
            // Removed grades + blank inputs → null (hidden in Created Fees).
            // Typed values (including 0) → Number(...).
            const gradePayload = {};
            grades.forEach((g) => {
                const key = g.sign.toLowerCase();
                if (editRemovedGrades.has(g.sign)) {
                    gradePayload[key] = null;
                    return;
                }
                const raw = editFees.gradeAmounts[g.sign];
                gradePayload[key] = raw === undefined || raw === null || raw === '' ? null : Number(raw);
            });

            const sendData = {
                additionalFeesID: editFees.id,
                rollNumber,
                year: selectedYear,
                feeName: editFees.feeName,
                remarks: editFees.remarks,
                paid: editFees.paid,
                dueDate: editFees.dueDate
                    ? (typeof editFees.dueDate === 'string'
                        ? editFees.dueDate.slice(0, 10)
                        : new Date(editFees.dueDate).toISOString().slice(0, 10))
                    : null,
                ...gradePayload,
            };

            const res = await axios.put(updateAdditionalFee, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Updated successfully");
            fetchStatusDetails()
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage(error.message || "Failed to save fee structure.");
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
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1 }}>
                        <IconButton
                            onClick={() =>
                                navigate("/dashboardmenu/approvals", {
                                    state: { tabIndex },
                                })
                            }
                            sx={{ width: "27px", height: "27px", mt: "3px", }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Additional Fee Approval</Typography>
                    </Grid>

                    <Grid
                        size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: "end" }} >

                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            borderRadius: "8px",
                            px: 2,
                        }}>
                            <Autocomplete
                                size="small"
                                options={academicYears}
                                sx={{ width: "170px" }}
                                value={selectedYear || ''}
                                onChange={(e, newValue) => { if (newValue) dispatch(setSelectedAcademicYear(newValue)) }}
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
            <Box sx={{ px: 2, pt: "60px" }}>

                <Grid container sx={{ pb: 2 }}>
                    {filteredDetails.length === 0 ? (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "77vh",
                                textAlign: "center",
                                width: "100%",
                            }}
                        >
                            <img
                                src={NoData}
                                alt="No data"
                                style={{ width: "30%", marginBottom: 16 }}
                            />
                            <Typography sx={{ color: "#777", fontWeight: 500 }}>
                                No pending approvals found
                            </Typography>
                        </Box>
                    ) : (
                        filteredDetails.map((item, index) => (
                            <Grid key={item} size={{ lg: 12, md: 8, }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                                    <Box sx={{ display: "flex", alignItems: "end" }}>
                                        <Box
                                            sx={{
                                                bgcolor: "#7B1FA2",
                                                color: "#fff",
                                                fontSize: "13px",
                                                px: 3,
                                                py: 0.2,
                                                ml: "15px",
                                                fontWeight: 600,
                                                borderTopLeftRadius: "7px",
                                                borderTopRightRadius: "7px",
                                                width: "fit-content",
                                                height: "20px"
                                            }}
                                        >
                                            {item.feeName}
                                        </Box>
                                        {item.requestFor && item.requestFor !== 'Approved' && (() => {
                                            const badge = getRequestBadge(item.requestFor);
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
                                    <Box
                                        sx={{
                                            color: "#000",
                                            fontSize: "13px",
                                            mt: "30px",
                                            px: 3,
                                            py: 0.2,
                                            ml: "15px",
                                            fontWeight: 600,
                                            borderTopLeftRadius: "7px",
                                            borderTopRightRadius: "7px",
                                            width: "fit-content",
                                        }}
                                    >

                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                                            <span style={{ fontSize: "12px", color: "#777", fontWeight: 500 }}>Requested By : </span>
                                            {item.requestedByName} - {item.requestedByRollNumber}
                                        </Typography>
                                        {/* <Typography
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                color: "#222",
                                            }}
                                        >
                                            <span style={{
                                                fontSize: "12px",
                                                color: "#777",
                                                fontWeight: 500,
                                            }}>  Created Time : </span>

                                            19/12/2025 - 12:11 PM
                                        </Typography> */}
                                    </Box>
                                </Box>
                                <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                                    <TableContainer
                                        sx={{
                                            border: "1px solid #E8DDEA",
                                            backgroundColor: "#fff",
                                            boxShadow: "none",
                                            borderRadius: "5px"
                                        }}
                                    >
                                        {(() => {
                                            const gradeEntries = getGradeEntries(item);
                                            const isGradeWise = gradeEntries.length > 0;

                                            return (
                                                <>
                                                    <Table stickyHeader aria-label="fee approval table" sx={{ minWidth: '100%' }}>
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
                                                                {!isGradeWise && (
                                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                                        Fee Amount
                                                                    </TableCell>
                                                                )}
                                                                <TableCell sx={{ textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                                    Due Date
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            <TableRow key={item.id}>
                                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                                    {item.feeName}
                                                                </TableCell>
                                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                                    {item.remarks}
                                                                </TableCell>
                                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                                    {item.paid === "Y" ? "Paid" : "Unpaid"}
                                                                </TableCell>
                                                                {!isGradeWise && (
                                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                                        {item.feeAmount}
                                                                    </TableCell>
                                                                )}
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {formatDate(item.dueDate)}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </>
                                            );
                                        })()}
                                    </TableContainer>

                                    
                                    {(() => {
                                        const gradeEntries = getGradeEntries(item);
                                        if (gradeEntries.length === 0) return null;
                                        return (
                                            <Box sx={{ backgroundColor: "#FFE5E5", p: 3, border: "1px solid #E8DDEA", borderTop: "none" }}>
                                                <Grid container spacing={2}>
                                                    {gradeEntries.map(([gradeKey, amount]) => (
                                                        <Grid size={{ xs: 6, sm: 4, md: 2, lg: 1.5 }} key={gradeKey}>
                                                            <Typography sx={{ color: "red", fontSize: "12px", mb: 0.5 }}>
                                                                {String(gradeKey).toUpperCase()}
                                                            </Typography>
                                                            <Box sx={{
                                                                border: "1px solid #0000003A", borderRadius: "5px",
                                                                height: "30px", backgroundColor: "#F6F6F8",
                                                                px: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                                            }}>
                                                                ₹ {amount}
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        );
                                    })()}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 1.5,
                                            mt: 3,
                                            pt: 2,
                                            borderTop: "1px solid #E8DDEA",
                                        }}
                                    >

                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                setRejectItem(item);
                                                setRejectReason("");
                                                setRejectError(false);
                                                setOpenRejectDialog(true)
                                            }}
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderRadius: "999px",
                                                px: 2.5,
                                                height: 28,
                                                boxShadow: "none",
                                            }}
                                        >
                                            Reject
                                        </Button>

                                        <Dialog
                                            open={openRejectDialog}
                                            onClose={() => setOpenRejectDialog(false)}
                                            maxWidth="sm"
                                            fullWidth
                                        >
                                            <DialogTitle
                                                sx={{
                                                    fontSize: "16px",
                                                    fontWeight: 600,
                                                    borderBottom: "1px solid #eee",
                                                }}
                                            >
                                                Reject Fee Approval
                                            </DialogTitle>

                                            <DialogContent sx={{ mt: 2 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: "13px",
                                                        color: "#555",
                                                        mb: 1,
                                                    }}
                                                >
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

                                            <DialogActions
                                                sx={{
                                                    px: 3,
                                                    py: 2,
                                                    borderTop: "1px solid #eee",
                                                    gap: 1,
                                                }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setOpenRejectDialog(false);
                                                        setRejectReason("");
                                                        setRejectError(false);
                                                    }}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        borderColor: "#ccc",
                                                        color: "#555",
                                                        height: "28px",
                                                        borderRadius: '999px'
                                                    }}
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => {
                                                        if (!rejectReason.trim()) {
                                                            setRejectError(true);
                                                            return;
                                                        }
                                                        handleSubmit(item.id, "decline");
                                                        setOpenRejectDialog(false);
                                                    }}

                                                    sx={{
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        height: "28px",
                                                        borderRadius: '999px',
                                                        boxShadow: "none"
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            </DialogActions>
                                        </Dialog>

                                        {userType === "superadmin" &&
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedFee(item);
                                                   
                                                    const gradeAmounts = {};
                                                    const removed = new Set();
                                                    grades.forEach((g) => {
                                                        const key = g.sign.toLowerCase();
                                                        const raw =
                                                            (item.grades && typeof item.grades === 'object' ? item.grades[key] : undefined)
                                                            ?? item[key];
                                                        if (raw === null || raw === undefined || raw === '') {
                                                            removed.add(g.sign);
                                                        } else {
                                                            gradeAmounts[g.sign] = String(raw);
                                                        }
                                                    });
                                                    setEditFees({
                                                        id: item.id,
                                                        feeName: item.feeName || '',
                                                        remarks: item.remarks || '',
                                                        paid: item.paid || 'Y',
                                                        dueDate: item.dueDate || null,
                                                        gradeAmounts,
                                                    });
                                                    setEditRemovedGrades(removed);
                                                    setOpenEditDialog(true);
                                                }}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    borderRadius: "999px",
                                                    height: 28,
                                                    borderColor: "#ccc",
                                                    color: "#555",
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        }






                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleSubmit(item.id, "accept")}
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderRadius: "999px",
                                                px: 3,
                                                height: 28,
                                                boxShadow: "none"
                                            }}
                                        >
                                            Accept
                                        </Button>
                                    </Box>

                                </Box>
                            </Grid>
                        )))}

                </Grid>
                <Dialog
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 600 }}>
                        Edit Fee Structure - {selectedClass}
                    </DialogTitle>

                    <DialogContent dividers>
                        <Box sx={{ border: '1px solid #FFD5C2', borderRadius: '5px', overflow: 'hidden' }}>

                            {/* Fee Details header */}
                            <Box sx={{ background: '#FFF5F2', borderBottom: '1px solid #FFD5C2', px: 3, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 30, height: 30, borderRadius: '6px', backgroundColor: '#FFD5C2', border: '1px solid #FFB088', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AddIcon sx={{ color: '#EA580C', fontSize: 15 }} />
                                </Box>
                                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#C2410C' }}>Fee Details</Typography>
                            </Box>

                            <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Fee Name</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={editFees.feeName}
                                        onChange={(e) => setEditFees((prev) => ({ ...prev, feeName: e.target.value }))}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Remarks</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={editFees.remarks}
                                        onChange={(e) => setEditFees((prev) => ({ ...prev, remarks: e.target.value }))}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Payment Status</Typography>
                                    <Autocomplete
                                        size="small"
                                        options={["Paid", "Unpaid"]}
                                        value={editFees.paid === "Y" ? "Paid" : "Unpaid"}
                                        onChange={(e, newValue) => setEditFees((prev) => ({ ...prev, paid: newValue === "Paid" ? "Y" : "N" }))}
                                        renderInput={(params) => <TextField {...params} placeholder="Select status" />}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Due Date</Typography>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        size="small"
                                        value={toInputDate(editFees.dueDate) || ''}
                                        onChange={(e) => setEditFees((prev) => ({ ...prev, dueDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Grade-wise header strip */}
                            <Box sx={{
                                background: '#FFF5F2',
                                borderTop: '1px solid #FFD5C2',
                                borderBottom: '1px solid #FFD5C2',
                                px: 3, py: 1.25,
                                display: 'flex', alignItems: 'center', gap: 1.5,
                            }}>
                                <Box sx={{
                                    width: 30, height: 30, borderRadius: '6px',
                                    backgroundColor: '#FFD5C2', border: '1px solid #FFB088',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <AddIcon sx={{ color: '#EA580C', fontSize: 15 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#C2410C' }}>
                                        Grade-wise Fee Amount
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#EA580C' }}>
                                        Setting ₹0 makes this fee free for that grade
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Removed grade chips */}
                            {editRemovedGrades.size > 0 && (
                                <Box sx={{ px: 3, pt: 1, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                                    <Typography sx={{ fontSize: 12, color: '#999' }}>Removed grades:</Typography>
                                    {[...editRemovedGrades].map((g) => (
                                        <Chip
                                            key={g}
                                            label={g}
                                            size="small"
                                            onClick={() => handleEditRestoreGrade(g)}
                                            icon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                                            sx={{
                                                fontSize: 12, height: 22, bgcolor: '#f5f5f5', border: '1px solid #ddd', cursor: 'pointer',
                                                '&:hover': { bgcolor: '#FFEDE5', borderColor: '#EA580C', color: '#EA580C' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Grade input grid */}
                            <Grid container spacing={2} sx={{
                                backgroundColor: '#FFEDE5', p: 3,
                                borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px',
                            }}>
                                {grades.filter((g) => !editRemovedGrades.has(g.sign)).map((grade) => (
                                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 1.5 }} key={grade.sign}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography sx={{ color: '#EA580C', fontSize: '12px', ml: 0.5 }}>{grade.sign}</Typography>
                                            <Tooltip title="Remove this grade" placement="top">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditRemoveGrade(grade.sign)}
                                                    sx={{
                                                        p: 0.3, color: '#bbb', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '50%',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': { color: '#fff', bgcolor: '#EA580C', transform: 'scale(1.15)' },
                                                    }}
                                                >
                                                    <ClearIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <TextField
                                            size="small"
                                            value={editFees.gradeAmounts[grade.sign] ?? ''}
                                            onChange={(e) => handleEditGradeChange(grade.sign, e.target.value)}
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                    inputMode: 'numeric',
                                                }
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { height: 33, fontSize: 14, borderRadius: '5px', backgroundColor: '#F6F6F8' } }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenEditDialog(false)}
                            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", height: 28, borderColor: "#ccc", color: "#555" }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                                handleUpdate()
                                setOpenEditDialog(false);
                            }}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "999px",
                                px: 3,
                                height: 28,
                                boxShadow: "none"
                            }}
                        >
                            Accept
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box >
    );
}
