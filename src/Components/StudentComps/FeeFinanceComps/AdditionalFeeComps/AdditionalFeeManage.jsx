import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    Grid,
    IconButton,
    Stack,
    Typography,
    SvgIcon,
    Divider,
    Autocomplete,
    TextField,
}
    from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { additionalFeeFetch, additionalFeeFetchID, additionalFeeStudentAdd, ecaFeeFetch, ecaFeeFetchID, ecaFeeStudentAdd, ecaFeeStudentFetch, GetUsersBaseDetails } from "../../../../Api/Api";
import StudentSelectionPopup from "../../../Tools/StudentSelectionPopup";
import SnackBar from "../../../SnackBar";
import Loader from "../../../Loader";
import { useSelector } from "react-redux";
import EcaStudentSelectionPopup from "../../../Tools/EcaStudentSelectionPopup";


export default function AdditionalFeeManage() {

    const token = "123"
    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
    const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState([])

    const [openTextarea, setOpenTextarea] = useState(false);
    const [openAddPopup, setOpenAddPopup] = useState(false);
    const [users, setUsers] = useState([]);
    const [specificNo, setSpecificNo] = useState("");
    const [additionalFetch, setAddtionalFetch] = useState([]);

    const [openStudentPopup, setOpenStudentPopup] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [existingStudents, setExistingStudents] = useState([]);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const academicYears = [
        `${currentYear - 2}-${currentYear - 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
    ];

    const handleOpenStudentPopup = (activity) => {
        setSelectedActivity(activity);
        setOpenStudentPopup(true);
    };

    const handleCloseStudentPopup = () => {
        setOpenStudentPopup(false);
        setSelectedActivity(null);
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
        getUsers()
    }, []);

    const getUsers = async () => {
        try {
            const res = await axios.get(GetUsersBaseDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(res.data.users)
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getEcaFees()
    }, [selectedYear]);

    const getEcaFees = async () => {
        try {
            const res = await axios.get(additionalFeeFetch, {
                params: {
                    Year: selectedYear
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAddtionalFetch(res.data)
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getEcaById = async (activityId) => {
        setIsLoading(true);
        try {
            const res = await axios.get(additionalFeeFetchID, {
                params: {
                    Id: activityId,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const rollNumbers =
                res.data.students?.map((stu) => stu.rollNumber) || [];

            setExistingStudents(rollNumbers);

        } catch (error) {
            console.error("Failed to fetch ECA students", error);
            setExistingStudents([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSaveStudents = async (studentsArray) => {

        setIsLoading(true);

        try {
            const sendData = {
                feeName: selectedActivity.feeName,
                paid: selectedActivity.paid || "",
                year: selectedYear,
                students: studentsArray,
            }

            const res = await axios.post(additionalFeeStudentAdd, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Message created successfully");


        } catch (error) {
            setMessage("An error occurred while creating the message.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box >
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {/* HEADER */}
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
                    <Grid size={{ xs: 12, md: 6, lg: 9 }} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: "3px" }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: "20px" }} >Additional Fee Manage</Typography>
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

            <Box sx={{ px: 2, pt: "60px" }}>
                {/* <Stack direction="row" justifyContent="end" py={2} pr={2}>
                    <Button
                        startIcon={
                            <SvgIcon viewBox="0 0 24 24">
                                <circle cx="18" cy="6" r="4" fill="#00a651" />
                                <path
                                    d="M16.4 6.1L17.6 7.3 19.6 5.2"
                                    stroke="#fff"
                                    strokeWidth="1.6"
                                    fill="none"
                                />
                            </SvgIcon>
                        }
                        variant="outlined"
                        sx={{
                            borderRadius: 50,
                            textTransform: "none",
                            fontSize: 13,
                            color: "#333",
                        }}
                        onClick={() => navigate("/dashboardmenu/fee/eca/eca-students")}
                    >
                        View students under ECA
                    </Button>
                </Stack> */}

                <Grid container spacing={3} px={3} pb={3} pt={3} alignItems="stretch">

                    {additionalFetch.map((activity) => (
                        <Grid size={{ sm: 12, xs: 12, lg: 3, md: 6 }} key={activity.id} >
                            <Card
                                sx={{
                                    border: "1px solid #9C27B0",
                                    borderRadius: 2,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    minHeight: "350px"

                                }}
                            >
                                {/* CARD HEADER */}
                                <Box sx={{ bgcolor: "#9c27b0", color: "#fff", px: 3, py: 1.4 }}>
                                    <Typography fontSize={14} fontWeight={600}>
                                        {activity.feeName}
                                    </Typography>
                                </Box>

                                {/* CARD BODY */}
                                <Box
                                    sx={{
                                        p: 3,
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                py: 0.8,
                                                borderBottom: "1px dashed #EEE",
                                            }}
                                        >
                                            <Typography fontSize={13} fontWeight={600} color="#555">
                                                Fee Name
                                            </Typography>
                                            <Typography
                                                fontSize={13}
                                                fontWeight={500}
                                                color={"#333"}
                                            >
                                                {activity.feeName}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                py: 0.8,
                                                borderBottom: "1px dashed #EEE",
                                            }}
                                        >
                                            <Typography fontSize={13} fontWeight={600} color="#555">
                                                Remarks
                                            </Typography>
                                            <Typography
                                                fontSize={13}
                                                fontWeight={500}
                                                color={"#333"}
                                            >
                                                {activity.feeName}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                py: 0.8,
                                                borderBottom: "1px dashed #EEE",
                                            }}
                                        >
                                            <Typography fontSize={13} fontWeight={600} color="#555">
                                                Payment Status
                                            </Typography>
                                            <Typography
                                                fontSize={13}
                                                fontWeight={500}
                                                color={"#333"}
                                            >
                                                {activity.paid === "Y" ? "Paid" : "Unpaid"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                py: 0.8,
                                                borderBottom: "1px dashed #EEE",
                                            }}
                                        >
                                            <Typography fontSize={13} fontWeight={600} color="#555">
                                                Fee Amount
                                            </Typography>
                                            <Typography
                                                fontSize={13}
                                                fontWeight={500}
                                                color={"#333"}
                                            >
                                                {activity.feeAmount}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                py: 0.8,
                                                borderBottom: "1px dashed #EEE",
                                            }}
                                        >
                                            <Typography fontSize={13} fontWeight={600} color="#555">
                                                Due Date
                                            </Typography>
                                            <Typography
                                                fontSize={13}
                                                fontWeight={500}
                                                color={"#333"}
                                            >
                                                {formatDate(activity.dueDate)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: "auto" }}>
                                        <Button
                                            onClick={() => {
                                                handleOpenStudentPopup(activity);
                                                getEcaById(activity.id);
                                            }}
                                            variant="outlined"
                                            sx={{
                                                textTransform: "none",
                                                borderColor: "#00963C",
                                                color: "#00963C",
                                                borderRadius: "999px",
                                                width: "100%",
                                                fontSize: "14px",
                                            }}
                                        >
                                            Add / Edit / Remove Student
                                        </Button>
                                    </Box>

                                </Box>
                            </Card>
                        </Grid> 
                    ))}
                </Grid>

                <EcaStudentSelectionPopup
                    open={openStudentPopup}
                    onClose={handleCloseStudentPopup}
                    users={users}
                    activity={selectedActivity}
                    value={existingStudents.join(', ')}
                    onSave={(payload) => handleSaveStudents(payload)}
                />
            </Box>

        </Box>
    );
}
