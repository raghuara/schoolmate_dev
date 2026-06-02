import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import {
    selectAcademicYear,
    selectAcademicYearOptions,
    setSelectedAcademicYear,
} from "../../../../Redux/Slices/academicYearSlice";
import NoData from '../../../../Images/Login/No Data.png'
import { ecaFeeFetch, ECAupdateSchoolFee, updateEcaFeesApprovalAction } from "../../../../Api/Api";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function EcaFeeApprovalPage() {
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
    const websiteSettings = useSelector(selectWebsiteSettings)

    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openCal, setOpenCal] = useState(false);

    const [rejectItem, setRejectItem] = useState(null);
    const [editItem, setEditItem] = useState(null);

    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState(false);
    const [editFees, setEditFees] = useState({ activityName: '', activityCategory: '', gradeAmounts: {}, dueDate: null });
    const [editRemovedGrades, setEditRemovedGrades] = useState(new Set());
    const [gradeErrors, setGradeErrors] = useState({});

    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [details, setDetails] = useState([]);

    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const formatDate = (dateString) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const getRequestBadge = (requestFor) => {
        switch ((requestFor || '').toLowerCase()) {
            case 'edit':
                return { label: 'Requested for Edit', bgcolor: '#FFF3E0', color: '#E65100', border: '#FFB74D' };
            case 'delete':
                return { label: 'Requested for Delete', bgcolor: '#FFEBEE', color: '#C62828', border: '#EF9A9A' };
            default:
                return { label: 'Requested for New', bgcolor: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' };
        }
    };

    const openEditFeeDialog = (item) => {
        if (!item || !grades?.length) return;
        const gradeAmounts = {};
        const removedGrades = new Set();
        grades.forEach((g) => {
            const val = item.grades?.[g.sign.toLowerCase()];
            if (val === null || val === undefined) {
                removedGrades.add(g.sign);
            } else {
                gradeAmounts[g.sign] = val;
            }
        });
        setEditItem(item);
        setEditFees({
            activityName: item.activityName,
            activityCategory: item.activityCategory,
            gradeAmounts,
            dueDate: item.dueDate ? dayjs(item.dueDate) : null,
        });
        setEditRemovedGrades(removedGrades);
        setGradeErrors({});
        setOpenEditDialog(true);
    };

    const handleEditGradeChange = (gradeSign, value) => {
        if (!/^\d{0,8}$/.test(value)) return;
        const cleaned = value.replace(/^0+(\d)/, '$1');
        setEditFees((prev) => ({ ...prev, gradeAmounts: { ...prev.gradeAmounts, [gradeSign]: cleaned } }));
        if (gradeErrors[gradeSign]) {
            setGradeErrors((prev) => { const next = { ...prev }; delete next[gradeSign]; return next; });
        }
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



    useEffect(() => {
        fetchStatusDetails()
    }, [selectedYear, selectedGradeId]);

    const fetchStatusDetails = async () => {
        if (!selectedYear) return; // wait for the global academic year to load
        setIsLoading(true);
        try {
            const res = await axios.get(ecaFeeFetch, {
                params: {
                    Year: selectedYear,
                    Status: "Requested"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDetails(res.data)
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
                updateEcaFeesApprovalAction,
                null,
                {
                    params: {
                        ecaFeesID: id,
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


    const handleUpdate = async () => {
        if (!editItem) return;
        if (!editFees.activityName.trim()) {
            setMessage('Activity Name is required'); setOpen(true); setColor(false); setStatus(false); return;
        }

        
        const errors = {};
        grades.forEach((g) => {
            if (!editRemovedGrades.has(g.sign)) {
                const val = editFees.gradeAmounts[g.sign];
                if (val === '' || val === undefined || val === null) {
                    errors[g.sign] = true;
                }
            }
        });
        if (Object.keys(errors).length > 0) {
            setGradeErrors(errors);
            const names = Object.keys(errors).join(', ');
            setMessage(`Please enter the amount for: ${names}`);
            setOpen(true); setColor(false); setStatus(false);
            return;
        }
        setGradeErrors({});

        setIsLoading(true);
        try {
            const gradePayload = {};
            grades.forEach((g) => {
                if (!editRemovedGrades.has(g.sign)) {
                    gradePayload[g.sign.toLowerCase()] = Number(editFees.gradeAmounts[g.sign]) || 0;
                }
            });
            const payload = {
                ecaFeesID: editItem.ecaFeesID || editItem.id,
                rollNumber,
                year: selectedYear,
                activityCategory: editFees.activityCategory,
                activityName: editFees.activityName,
                paid: editItem.paid,
                dueDate: editFees.dueDate ? dayjs(editFees.dueDate).format('YYYY-MM-DD') : null,
                ...gradePayload,
            };
            await axios.put(ECAupdateSchoolFee, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOpen(true); setColor(true); setStatus(true);
            setMessage("Updated successfully");
            setOpenEditDialog(false);
            fetchStatusDetails();
        } catch (error) {
            setOpen(true); setColor(false); setStatus(false);
            setMessage(error?.response?.data?.message || "Failed to save fee structure.");
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
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Extracurricular Activity Fee Approval</Typography>
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
                                    <Box sx={{ display: "flex", alignItems: "end", gap: 1 }}>
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
                                            {item.activityName} - {item.activityCategory}
                                        </Box>
                                        {item.requestFor && item.requestFor !== 'Approved' && (() => {
                                            const badge = getRequestBadge(item.requestFor);
                                            return (
                                                <Chip
                                                    label={badge.label}
                                                    size="small"
                                                    sx={{
                                                        mb: 0.2,
                                                        height: 20,
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        bgcolor: badge.bgcolor,
                                                        color: badge.color,
                                                        border: `1px solid ${badge.border}`,
                                                        borderRadius: '6px',
                                                        '& .MuiChip-label': { px: 1 },
                                                    }}
                                                />
                                            );
                                        })()}
                                    </Box>
                                    <Box
                                        sx={{
                                            color: "#000",
                                            fontSize: "13px",
                                            mt: "20px",
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
                                            // borderRadius: "5px"
                                        }}
                                    >
                                        <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F2E8F6" }}>
                                                        Fee Name
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F2E8F6" }}>
                                                        Remarks
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F2E8F6" }}>
                                                        Payment Status
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#F2E8F6" }}>
                                                        Due Date
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow key={item.id}>
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
                                        <Box sx={{ backgroundColor: "#FFE5E5", p: 3, border: "1px solid #E8DDEA", borderTop: "none" }}>
                                            <Grid container spacing={2}>
                                                {Object.entries(item.grades || {}).filter(([, amount]) => amount !== null).map(
                                                    ([gradeKey, amount]) => (
                                                        <Grid size={{ lg: 1.5 }} key={gradeKey}>
                                                            <Typography sx={{ color: "red", fontSize: "12px", mb: 0.5 }}>
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

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 1.5,
                                            pt: 2,
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
                                                onClick={() => openEditFeeDialog(item)}
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
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: '10px', overflow: 'hidden' } }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1.5, backgroundColor: '#f2f2f2', borderBottom: '1px solid #ddd' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Edit ECA Activity Fee</Typography>
                        <IconButton size="small" onClick={() => setOpenEditDialog(false)}>
                            <CloseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        <Box sx={{ border: '1px solid #CCC', borderRadius: '5px' }}>
                            <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Activity Name</Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={editFees.activityName}
                                        onChange={(e) => setEditFees((prev) => ({ ...prev, activityName: e.target.value }))}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Activity Category</Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={editFees.activityCategory}
                                        onChange={(e) => setEditFees((prev) => ({ ...prev, activityCategory: e.target.value }))}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Due Date</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            open={openCal}
                                            onClose={() => setOpenCal(false)}
                                            value={editFees.dueDate}
                                            onChange={(newValue) => {
                                                setEditFees((prev) => ({ ...prev, dueDate: newValue }));
                                                setOpenCal(false);
                                            }}
                                            disablePast
                                            views={['year', 'month', 'day']}
                                            renderInput={() => null}
                                            sx={{ opacity: 0, pointerEvents: 'none', width: '0px' }}
                                        />
                                        <Button
                                            sx={{ width: '150px', height: '35px', backgroundColor: '#F3E5F5', textTransform: 'none', color: '#8600BB' }}
                                            onClick={() => setOpenCal(true)}
                                        >
                                            {editFees.dueDate ? dayjs(editFees.dueDate).format('DD-MM-YYYY') : 'Add Due Date'}
                                            <CalendarMonthIcon style={{ color: '#8600BB', marginLeft: '10px', fontSize: '20px' }} />
                                        </Button>
                                        {editFees.dueDate && (
                                            <IconButton sx={{ width: '33px', height: '33px' }} onClick={() => setEditFees((prev) => ({ ...prev, dueDate: null }))}>
                                                <HighlightOffIcon style={{ color: 'red' }} />
                                            </IconButton>
                                        )}
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>

                            {/* Removed grade chips */}
                            {editRemovedGrades.size > 0 && (
                                <Box sx={{ px: 3, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
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
                                                '&:hover': { bgcolor: '#ede7f6', borderColor: '#7B1FA2', color: '#7B1FA2' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Grade amounts */}
                            <Grid container spacing={2} sx={{ backgroundColor: '#FFE5E5', p: 3, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}>
                                {grades.filter((g) => !editRemovedGrades.has(g.sign)).map((grade) => (
                                    <Grid size={{ lg: 1.5, md: 2, sm: 3, xs: 4 }} key={grade.sign}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography sx={{ color: 'red', fontSize: '12px', ml: 0.5 }}>{grade.sign}</Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditRemoveGrade(grade.sign)}
                                                sx={{
                                                    p: 0.3, color: '#bbb', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '50%',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': { color: '#fff', bgcolor: '#f44336', transform: 'scale(1.15)' },
                                                }}
                                            >
                                                <ClearIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Box>
                                        <TextField
                                            size="small"
                                            value={editFees.gradeAmounts[grade.sign] ?? ''}
                                            onChange={(e) => handleEditGradeChange(grade.sign, e.target.value)}
                                            variant="outlined"
                                            error={!!gradeErrors[grade.sign]}
                                            helperText={gradeErrors[grade.sign] ? 'Amount required' : ''}
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                    inputMode: 'numeric',
                                                }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': { height: 33, fontSize: 14, borderRadius: '5px', backgroundColor: '#F6F6F8' },
                                                '& .MuiFormHelperText-root': { fontSize: '10px', mx: 0, mt: 0.3 },
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'end', px: 2, py: 1.5, borderTop: '1px solid #eee', gap: 1 }}>
                        <Button
                            onClick={() => setOpenEditDialog(false)}
                            sx={{ border: '1px solid #000', borderRadius: '30px', textTransform: 'none', width: '100px', height: '30px', color: '#000' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            sx={{
                                backgroundColor: websiteSettings.mainColor, borderRadius: '30px', textTransform: 'none',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.1)',
                                px: 3, height: '30px', color: websiteSettings.textColor,
                            }}
                        >
                            Update
                        </Button>
                    </Box>
                </Dialog>
            </Box>
        </Box >
    );
}
