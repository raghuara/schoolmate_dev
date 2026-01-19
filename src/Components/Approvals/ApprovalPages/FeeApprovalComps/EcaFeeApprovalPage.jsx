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
import { additionalFeeFetch, approvalStatusCheck, ecaFeeFetch, ECAupdateSchoolFee, updateAdditionalFee, updateAdditionalFeesApprovalAction, updateEcaFeesApprovalAction, updateSchoolFee, updateSchoolFeesApprovalAction } from "../../../../Api/Api";

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
    const [selectedFee, setSelectedFee] = useState(null);

    const isExpanded = useSelector((state) => state.sidebar.isExpanded);



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

    const openEditFeeDialog = (item) => {
        if (!item || !grades?.length) return;

        const gradeFees = grades.map((g) => {
            const key = g.sign.toLowerCase();

            return {
                sign: key,
                amount: Number(item.grades?.[key] ?? 0),
            };
        });

        setEditFees([
            {
                ...item,
                gradeFees,
            },
        ]);

        setOpenEditDialog(true);
    };



    useEffect(() => {
        fetchStatusDetails()
    }, [selectedYear, selectedGradeId]);

    const fetchStatusDetails = async () => {
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
        const createdBy = item.createdByRollNumber ?? "";
        const editedBy = item.editedByRollnumber ?? "";

        return createdBy !== rollNumber && editedBy !== rollNumber;
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


    const handleUpdate = async (status) => {

        setIsLoading(true);
        try {
            const fee = editFees[0];

            const payload = {
                ecaFeesID: fee.id,
                rollNumber,
                year: selectedYear,
                activityCategory: fee.activityCategory,
                activityName: fee.activityName,
                paid: fee.paid,
                dueDate: fee.dueDate
            };

            fee.gradeFees.forEach(g => {
                payload[g.sign] = Number(g.amount);
            });

            const res = await axios.put(ECAupdateSchoolFee, payload, {
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
                                            {item.activityName} -  {item.activityCategory}
                                        </Box>


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

                                        <Typography sx={{
                                            fontSize: "13px", fontWeight: 600, color: "#555",
                                        }} >
                                            <span style={{
                                                fontSize: "12px",
                                                color: "#777",
                                                fontWeight: 500,
                                            }}>  Created By : </span>  {item.createdByRollName} - {item.createdByRollNumber}
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
                                        {["Fee Name", "Remarks", "Payment Status", "Due Date"].map((h) => (
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
                                    {Array.isArray(editFees) && editFees.map((fee, i) => (
                                        <TableRow key={i}>
                                            <TableCell sx={{ border: "1px dotted #ccc" }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={fee.activityName}
                                                    onChange={(e) => {
                                                        const updated = [...editFees];
                                                        updated[i].activityName = e.target.value;
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
                                                    value={fee.activityCategory}
                                                    onChange={(e) => {
                                                        const updated = [...editFees];
                                                        updated[i].activityCategory = e.target.value;
                                                        setEditFees(updated);
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ border: "1px dotted #ccc", minWidth: 250 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={["Paid", "Unpaid"]}
                                                    value={fee.paid === "Y" ? "Paid" : "Unpaid"}
                                                    onChange={(e, newValue) => {
                                                        const updated = [...editFees];
                                                        updated[i].paid = newValue === "Paid" ? "Y" : "N";
                                                        setEditFees(updated);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select status"
                                                        />
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ border: "1px dotted #ccc", textAlign: "center" }}>
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={toInputDate(fee.dueDate)}
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
                            
                            {editFees.length > 0 && editFees[0]?.paid === "Y" && (

                                <Box
                                    sx={{
                                        backgroundColor: "#FFE5E5",
                                        p: 3,
                                        border: "1px solid #E8DDEA",
                                        borderTop: "none",
                                        mt: 2,
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        {editFees.length > 0 &&
                                            editFees[0]?.gradeFees?.map((g, index) => (
                                                <Grid size={{ lg: 1.5, md: 2, sm: 3, xs: 4 }} key={g.sign}>
                                                    <Typography
                                                        sx={{
                                                            color: "red",
                                                            fontSize: "12px",
                                                            mb: 0.5,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {g.sign.toUpperCase()}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            border: "1px solid #0000003A",
                                                            borderRadius: "5px",
                                                            height: "32px",
                                                            backgroundColor: "#F6F6F8",
                                                            px: 1,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <TextField
                                                            variant="standard"
                                                            value={g.amount}
                                                            onChange={(e) => {
                                                                const value = e.target.value;

                                                                if (/^\d*$/.test(value)) {
                                                                    const updated = [...editFees];
                                                                    updated[0].gradeFees[index].amount =
                                                                        value === "" ? "" : Number(value);
                                                                    setEditFees(updated);
                                                                }
                                                            }}
                                                            slotProps={{
                                                                input: {
                                                                    disableUnderline: true,
                                                                    startAdornment: (
                                                                        <Typography sx={{ fontSize: "13px", mr: 0.5 }}>
                                                                            ₹
                                                                        </Typography>
                                                                    ),
                                                                    inputProps: {
                                                                        inputMode: "numeric",
                                                                        pattern: "[0-9]*",
                                                                        style: {
                                                                            fontWeight: 600,
                                                                            fontSize: "13px",
                                                                            width: "60px",
                                                                        },
                                                                    },
                                                                },
                                                            }}
                                                        />


                                                    </Box>
                                                </Grid>
                                            ))}
                                    </Grid>
                                </Box>
                            )}

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
            </Box>
        </Box >
    );
}
