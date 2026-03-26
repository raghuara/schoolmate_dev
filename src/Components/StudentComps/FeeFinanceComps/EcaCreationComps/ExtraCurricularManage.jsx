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
    Dialog,
    DialogContent
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ecaFeeFetch, ecaFeeFetchID, ecaFeeStudentAdd, ecaFeeStudentFetch, getEligibleEcaStudents } from "../../../../Api/Api";
import AddAdmissionNumbersDialog from "../../../AddAdmissionNumberDialog";
import StudentSelectionPopup from "../../../Tools/StudentSelectionPopup";
import SnackBar from "../../../SnackBar";
import Loader from "../../../Loader";
import EcaStudentSelectionPopup from "../../../Tools/EcaStudentSelectionPopup";


export default function ExtraCurricularManage() {

    const token = "123"
    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
    const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState([])

    const [openTextarea, setOpenTextarea] = useState(false);
    const [openAddPopup, setOpenAddPopup] = useState(false);
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [specificNo, setSpecificNo] = useState("");
    const [ecaFetch, setEcaFetch] = useState([]);

    const [openStudentPopup, setOpenStudentPopup] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [existingStudents, setExistingStudents] = useState([]);


    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');


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

    const getEligibleStudents = async (activity) => {
        try {
            const res = await axios.get(getEligibleEcaStudents, {
                params: {
                    ActivityCategoryAndName: `${activity.activityCategory}-${activity.activityName}`,
                    Paid: activity.paid || 'Y',
                    Year: selectedYear,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            const flat = (res.data || []).flatMap((g) => g.students || []);
            setEligibleStudents(flat);
        } catch (error) {
            console.error('Failed to fetch eligible students', error);
            setEligibleStudents([]);
        }
    };

    useEffect(() => {
        getEcaFees()
    }, [selectedYear]);

    const getEcaFees = async () => {
        try {
            const res = await axios.get(ecaFeeFetch, {
                params: {
                    Year: selectedYear
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setEcaFetch(res.data)
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }



    const getEcaById = async (activityId) => {
        setIsLoading(true);
        try {
            const res = await axios.get(ecaFeeFetchID, {
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
                activityCategoryAndName: `${selectedActivity.activityCategory}-${selectedActivity.activityName}`,
                paid: selectedActivity.paid || "",
                year: selectedYear,
                students: studentsArray
            }

            const res = await axios.post(ecaFeeStudentAdd, sendData, {
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
            <Box sx={{ backgroundColor: "#f2f2f2", borderRadius: "10px 10px 10px 0px", px: 2, borderBottom: "1px solid #ddd" }}>
                <Grid container>
                    <Grid size={{ xs: 12, md: 6, lg: 9 }} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: "3px", mr: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: "20px" }} > Extra Curricular activity Manage</Typography>
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

            <Box sx={{ height: "83vh", overflowY: "auto" }}>
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

                    {ecaFetch.filter((activity) => activity.level === "A").map((activity) => (
                        <Grid size={{ sm: 12, xs: 12, lg: 3, md: 6 }} key={activity.id} >
                            <Card
                                sx={{
                                    border: "1px solid #9C27B0",
                                    borderRadius: 2,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    minHeight: "400px"

                                }}
                            >
                                {/* CARD HEADER */}
                                <Box sx={{ bgcolor: "#9c27b0", color: "#fff", px: 3, py: 1.4 }}>
                                    <Typography fontSize={14} fontWeight={600}>
                                        {activity.activityCategory} - {activity.activityName}
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

                                    <Typography fontSize={12} mb={2}>
                                        Eligible Class & Fee :
                                    </Typography>

                                    {/* GRADES */}
                                    {activity.paid === "Y" ? (
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(3, 1fr)",
                                                gap: 1.2,
                                                mb: 3,
                                            }}
                                        >
                                            {Object.entries(activity.grades || {}).map(([gradeKey, amount]) => (
                                                    <Box key={gradeKey} textAlign="center">
                                                        <Typography fontSize={11}>{gradeKey.toUpperCase()}</Typography>
                                                        <Box
                                                            sx={{
                                                                border: "1px solid #dedede",
                                                                borderRadius: 50,
                                                                py: 0.6,
                                                                px: 1.6,
                                                                mt: 0.5,
                                                            }}
                                                        >
                                                            <Typography fontSize={10}> ₹ {amount}</Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                        </Box>
                                    ) : (

                                        <Box
                                            sx={{
                                                textAlign: "center",
                                                py: 3,
                                                border: "1px dashed #ccc",
                                                borderRadius: 2,
                                                backgroundColor: "#fafafa",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#777",
                                                }}
                                            >
                                                No cost for this activity
                                            </Typography>
                                        </Box>

                                    )
                                    }
                                    < Box sx={{ mt: "auto" }}>
                                        {activity.paid === "Y" &&
                                            <Button
                                                onClick={() => {
                                                    handleOpenStudentPopup(activity);
                                                    getEcaById(activity.id);
                                                    getEligibleStudents(activity);
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
                                        }
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <EcaStudentSelectionPopup
                    open={openStudentPopup}
                    onClose={handleCloseStudentPopup}
                    users={eligibleStudents}
                    activity={selectedActivity}
                    existingStudents={existingStudents}
                    onSave={(payload) => handleSaveStudents(payload)}
                />
            </Box>

        </Box >
    );
}
