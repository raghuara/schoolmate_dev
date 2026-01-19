import { Autocomplete, Box, Button, Card, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, Popper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import NoData from '../../../../Images/Login/No Data.png'
import { approvalStatusCheck, updateSchoolFee, updateSchoolFeesApprovalAction } from "../../../../Api/Api";

export default function SchoolFeeApprovalPage() {
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

    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const [rejectItem, setRejectItem] = useState(null);
    const [editItem, setEditItem] = useState(null);


    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState(false);
    const [editFees, setEditFees] = useState([]);

    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [details, setDetails] = useState([]);
    const [feesData, setFeesData] = useState([]);

    const [gradeId, setGradeId] = useState([]);


    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedGradeSign(newValue.sign);
        } else {
            setSelectedGradeId("");
            setSelectedGradeSign(null);
        }
    };


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

    const toInputDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
    };


    useEffect(() => {
        fetchStatusDetails()
    }, [selectedGradeId, selectedYear])

    const fetchStatusDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(approvalStatusCheck, {
                params: {
                    RollNumber: rollNumber,
                    Year: selectedYear,
                    Status: "Requested"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDetails(res.data)
            setFeesData(res.data.fees || []);
            setGradeId(res.data.gradeId)
        } catch (error) {
            console.error(error);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No Data");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFees = selectedGradeSign
        ? feesData.filter((item) => item.grade === selectedGradeSign)
        : feesData;

    const showNoData =
        !feesData.length ||
        !filteredFees.some(item => item.fees && item.fees.length > 0);

    const handleSubmit = async (id, action) => {
        setIsLoading(true);

        try {
            const res = await axios.put(
                updateSchoolFeesApprovalAction,
                null,
                {
                    params: {
                        primeSchoolFeesID: id,
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


    const handleUpdate = async (status) => {

        setIsLoading(true);
        try {

            const sendData = {
                PrimeSchoolFeesID: editItem.primeSchoolFeesID,
                gradeId: String(editItem.gradeId),
                year: selectedYear,
                rollNumber: rollNumber,
                fees: editFees.map(fee => ({
                    feeDetails: fee.feeDetails,
                    feeDescription: fee.feeDescription,
                    feeAmount: Number(
                        String(fee.feeAmount).replace(/[₹,]/g, "")
                    ),
                    dueDate: fee.dueDate || null,
                })),
            }

            const res = await axios.put(updateSchoolFee, sendData, {
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
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <IconButton
                            onClick={() =>
                                navigate("/dashboardmenu/approvals", {
                                    state: { tabIndex },
                                })
                            }
                            sx={{ width: "27px", height: "27px", mt: "3px", mr: 1 }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >School Fee Approval</Typography>
                    </Grid>
                    <Grid
                        size={{ xs: 6, sm: 6, md: 3, lg: 3 }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "end",
                        }}
                    >
                        <Autocomplete
                            disablePortal
                            options={grades}
                            getOptionLabel={(option) => option.sign}
                            value={grades.find((item) => item.id === selectedGradeId) || null}
                            onChange={(event, newValue) => handleGradeChange(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ width: "160px", mt: 0.5 }}
                            slots={{
                                popper: Popper,
                            }}

                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "preventOverflow",
                                            options: { boundary: "window" },
                                        },
                                    ],
                                    sx: {
                                        maxHeight: "180px",
                                        overflowY: "auto",
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                        borderRadius: "6px",
                                    },
                                },
                                listbox: {
                                    sx: {
                                        fontSize: "14px",
                                        padding: "5px",
                                    },
                                },

                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "34px",
                                            fontSize: "13px",
                                            fontWeight: "600"
                                        },
                                        "& input": {
                                            padding: "6px 8px",
                                        },
                                    }}
                                />
                            )}
                        />

                    </Grid>
                    <Grid
                        size={{ xs: 6, sm: 6, md: 3, lg: 3 }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1.5,
                            borderRadius: "8px",
                            px: 2,
                            py: 1,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#555",
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
                                            borderRadius: "6px",
                                            backgroundColor: "#fafafa",
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#ddd",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#bbb",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#1976d2",
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ px: 2 }}>
                {showNoData && (
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

                )}
                <Grid container sx={{ pb: 2 }}>
                    {!showNoData &&
                        filteredFees.map((item) => (
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
                                            {item.grade}
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                ml: 1.5,
                                                px: 1.6,
                                                py: "3px",
                                                borderRadius: "6px",
                                                backgroundColor: "#EEF4FF",
                                                border: "1px solid #C7D7FE",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "11.5px",
                                                    color: "#4B5563",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Requested for
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    color: "#1D4ED8",
                                                }}
                                            >
                                                New
                                            </Typography>
                                        </Box>


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

                                        <Typography sx={{
                                            fontSize: "13px", fontWeight: 600, color: "#555",
                                        }} >
                                            <span style={{
                                                fontSize: "12px",
                                                color: "#777",
                                                fontWeight: 500,
                                            }}>  Created By : </span>  {item.createdBy}
                                            {/* <span style={{ color: "#666", fontWeight: 500 }}>
                                            (Admin)
                                        </span> */}
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
                                        <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                        S.No
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                        Fee Details
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                        Description
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                        Amount
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                        Due Date
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {item.fees?.map((row, index) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            {row.feeDetails}
                                                        </TableCell>

                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            {row.feeDescription}
                                                        </TableCell>

                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            {row.feeAmount}
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {formatDate(row.dueDate)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
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
                                                        handleSubmit(item.primeSchoolFeesID, "decline");
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

                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setEditItem(item);
                                                setOpenEditDialog(true);

                                                setEditFees(
                                                    item.fees.map(fee => ({
                                                        ...fee,
                                                        feeAmount: fee.feeAmount?.toString() || "",
                                                        dueDate: fee.dueDate ? fee.dueDate.split("T")[0] : "",
                                                        openCal: false,
                                                    }))
                                                );
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
                                                <Card sx={{ borderRadius: 0, boxShadow: "none" }}>
                                                    <Table sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                                                        <TableHead sx={{ bgcolor: "#f3e5f5" }}>
                                                            <TableRow>
                                                                {["Fee Details", "Description", "Amount", "Due Date"].map((h) => (
                                                                    <TableCell
                                                                        key={h}
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: 14,
                                                                            border: "1px dotted #ccc",
                                                                        }}
                                                                    >
                                                                        {h}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        </TableHead>

                                                        <TableBody>
                                                            {editFees.map((fee, i) => (
                                                                <TableRow key={i}>
                                                                    <TableCell sx={{ border: "1px dotted #ccc" }}>
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={fee.feeDetails}
                                                                            onChange={(e) => {
                                                                                const updated = [...editFees];
                                                                                updated[i].feeDetails = e.target.value;
                                                                                setEditFees(updated);
                                                                            }}
                                                                            variant="outlined"
                                                                            sx={{
                                                                                "& fieldset": { border: "none" },
                                                                                fontSize: 14,
                                                                            }}
                                                                        />
                                                                    </TableCell>

                                                                    <TableCell sx={{ border: "1px dotted #ccc", minWidth: 250 }}>
                                                                        <TextField
                                                                            fullWidth
                                                                            multiline
                                                                            rows={2}
                                                                            size="small"
                                                                            value={fee.feeDescription}
                                                                            onChange={(e) => {
                                                                                const updated = [...editFees];
                                                                                updated[i].feeDescription = e.target.value;
                                                                                setEditFees(updated);
                                                                            }}
                                                                        />
                                                                    </TableCell>

                                                                    <TableCell sx={{ border: "1px dotted #ccc" }}>
                                                                        <TextField
                                                                            size="small"
                                                                            value={fee.feeAmount.replace(/[₹,]/g, "")}
                                                                            onChange={(e) => {
                                                                                const updated = [...editFees];
                                                                                updated[i].feeAmount = `₹${e.target.value}`;
                                                                                setEditFees(updated);
                                                                            }}
                                                                            InputProps={{
                                                                                startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
                                                                            }}
                                                                            sx={{ width: 150 }}
                                                                        />
                                                                    </TableCell>

                                                                    <TableCell sx={{ border: "1px dotted #ccc", textAlign: "center" }}>
                                                                        <TextField
                                                                            type="date"
                                                                            size="small"
                                                                            value={fee.dueDate}
                                                                            onChange={(e) => {
                                                                                const updated = [...editFees];
                                                                                updated[i].dueDate = e.target.value;
                                                                                setEditFees(updated);
                                                                            }}
                                                                            InputLabelProps={{ shrink: true }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
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



                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleSubmit(item.primeSchoolFeesID, "accept")}
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
                        ))}
                </Grid>
            </Box>
        </Box >
    );
}
