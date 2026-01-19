import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, Paper, Popper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import { approvalStatusCheck, deleteSchoolFeesStructure } from "../../../../Api/Api";
import NoData from '../../../../Images/Login/No Data.png';
import DeleteIcon from '@mui/icons-material/Delete';


export default function SchoolFeeApprovalStatus() {

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


    const academicYears = [
        `${currentYear - 2}-${currentYear - 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
    ];

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedGradeSign(newValue.sign);
        } else {
            setSelectedGradeId("");
            setSelectedGradeSign(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
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
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDetails(res.data)
            setFeesData(res.data.fees || []);
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


    const handleDelete = async () => {
        if (!deleteId) return;

        setIsLoading(true);
        try {
            const res = await axios.delete(deleteSchoolFeesStructure, {
                params: {
                    primeSchoolFeesID: deleteId,
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
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <IconButton
                            onClick={() =>
                                navigate("/dashboardmenu/status", {
                                    state: { tabIndex },
                                })
                            }
                            sx={{ width: "27px", height: "27px", mt: "3px", mr: 1 }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>

                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >School Fee Approval Status</Typography>
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
            <Box>
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

                <Box sx={{height:"83vh", overflowY:"auto", px:2}}>
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

                                            {item.status === "Requested" &&
                                                <Box
                                                    sx={{
                                                        ml: 0.5,
                                                        height: 22,
                                                        px: 1.6,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.6,
                                                        borderRadius: "999px",
                                                        backgroundColor: "#FFF4E5",
                                                        border: "1px solid #FFB74D",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#FB8C00",
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            color: "#E65100",
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
                                                        borderRadius: "999px",
                                                        backgroundColor: "#FDECEA",
                                                        border: "1px solid #F5A5A0",
                                                    }}
                                                >
                                                    <Box

                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#D32F2F",
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            color: "#B71C1C",
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
                                                        borderRadius: "999px",
                                                        backgroundColor: "#E8F5E9",
                                                        border: "1px solid #81C784",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#2E7D32",
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            color: "#1B5E20",
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
                                                    onClick={() => setOpenReasonId(item.primeSchoolFeesID)}
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
                                                open={openReasonId === item.primeSchoolFeesID}
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
                                                        setDeleteId(item.primeSchoolFeesID);
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
