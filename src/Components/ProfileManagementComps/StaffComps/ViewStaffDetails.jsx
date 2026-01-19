import React, { useEffect, useRef, useState } from "react";
import { Box, Stepper, Step, StepLabel, Typography, IconButton, useMediaQuery, Grid, Button, FormLabel, RadioGroup, FormControlLabel, Radio, FormControl, Accordion, AccordionSummary, AccordionDetails, TextField, FormGroup, Checkbox, Autocomplete, Paper, Popper, InputAdornment, Dialog, TextareaAutosize, DialogContent, DialogActions, FormHelperText, Popover } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import { FindStaffManagementDetails, postStaffInformation, postStaffStudentInformation, } from "../../../Api/Api";
import axios from "axios";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import avatarImage from '../../../Images/PagesImage/dummy-image.jpg'


export default function ViewStaffDetails() {
    const inputRef = useRef(null);
    const token = "123"
    const theme = useTheme();
    const user = useSelector((state) => state.auth);
    const nextId = useRef(2);
    const RollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeStep, setActiveStep] = useState(0);
    const [count, setCount] = useState(0);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [changesHappended, setChangesHappended] = useState(false);
    const [fileType, setFileType] = useState('');
    const [isLoading, setIsLoading] = useState('');
    const location = useLocation();
    const selectedRollNumber = location.state?.rollNumber;

    const [selectedGradeId, setSelectedGradeId] = useState("");
    const [selectedSiblingClass, setSelectedSiblingClass] = useState("");
    const [selectedSection, setSelectedSection] = useState(null);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const selectedGrade = grades.find((grade) => grade.sign === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const selectedClass = grades.find((grade) => grade.sign === selectedSiblingClass);
    const siblingSections = selectedClass?.sections.map((section) => ({ sectionName: section })) || [];
    const [value, setValue] = useState("");
    const [staffInfo, setStaffInfo] = useState([]);
    const [staffStudentInfo, setStaffStudentInfo] = useState([]);

    const ChipRow = ({ label, value }) => (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                my: 1,
                px: 1.5,
                py: 0.8,
                borderRadius: "14px",
                background: "#f4f6f8",
                border: "1px solid #ddd"
            }}
        >
            <Typography sx={{ fontSize: 13, color: "#666" }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {value || "-"}
            </Typography>
        </Box>
    );

    const StatusTile = ({ label, value, highlight }) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
                sx={{
                    p: 2,
                    borderRadius: "16px",
                    background: highlight
                        ? "linear-gradient(135deg,#00c853,#b2ff59)"
                        : "#F6F6F8",
                    color: highlight ? "#fff" : "#000",
                    border: "1px solid #ddd"
                }}
            >
                <Typography sx={{ fontSize: 12, opacity: 0.8 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                    {value || "-"}
                </Typography>
            </Box>
        </Grid>
    );


    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
    }, [value]);

    const handleEditClick = (id) => {
        navigate("/dashboardmenu/profile/staff/edit", { state: { id } });
    };

    useEffect(() => {
        fetchAllData()
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindStaffManagementDetails, {
                params: {
                    RollNumber: selectedRollNumber || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStaffInfo(res.data.staffinfo)
            setStaffStudentInfo(res.data.staffstudentinfo)


            const staffdetails = res.data.staffinfo


        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to fetch data!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", borderRadius: "10px 10px 10px 0px", px: 2, borderBottom: "1px solid #ddd", }}>
                <Grid container sx={{ py: 1.5 }}>
                    <Grid size={{ xs: 12, md: 6, lg: 9 }} sx={{ display: "flex", alignItems: "center" }}>

                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: "3px", mr: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: "20px" }}>View Staff Details</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                        <Typography sx={{ color: "#7F7F7F", fontSize: "16px" }}>
                            Academic Year: {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                {/* <Box sx={{ mt: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => (
                            <Step key={index}>
                                <StepLabel>{isMobile ? "" : label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box> */}
                <Box sx={{ p: 2 }}>
                    <Box>
                        <Grid
                            container
                            spacing={3}
                            sx={{
                                p: 3,
                                // background: "linear-gradient(135deg,#fdfbfb,#ebedee)",
                                borderRadius: "24px",
                            }}
                        >
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box
                                    sx={{
                                        position: "sticky",
                                        top: "50px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            borderRadius: "5px",
                                            overflow: "hidden",
                                            border: "1px solid rgba(0,0,0,0.1)",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                            backgroundColor: "#fff",
                                            minHeight: "500px",
                                        }}
                                    >
                                        {/* HEADER */}
                                        <Box
                                            sx={{
                                                height: 90,
                                                backgroundColor: websiteSettings.mainColor,
                                            }}
                                        />

                                        {/* PROFILE IMAGE */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                mt: "-45px",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 90,
                                                    height: 90,
                                                    borderRadius: "50%",
                                                    border: "4px solid #fff",
                                                    overflow: "hidden",
                                                    backgroundColor: "#fff",
                                                }}
                                            >
                                                <img
                                                    src={staffInfo?.[0]?.staffPassportSizePhotofilepath || avatarImage}
                                                    alt="profile"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* DETAILS */}
                                        <Box sx={{ textAlign: "center", px: 2, pb: 3, pt: 1 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                {staffInfo?.[0]?.staffNameInEnglish}
                                            </Typography>

                                            <Typography sx={{ fontSize: 13, color: "#777", mb: 2 }}>
                                                {staffInfo?.[0]?.staffDesignation}
                                            </Typography>

                                            <ChipRow label="Roll No" value={staffInfo?.[0]?.staffRollNumber} />
                                            <ChipRow label="Gender" value={staffInfo?.[0]?.gender} />
                                            <ChipRow
                                                label="Class"
                                                value={`${staffInfo?.[0]?.grade}-${staffInfo?.[0]?.section}`}
                                            />
                                            <ChipRow label="Date Of Birth" value={staffInfo?.[0]?.dateOfBirth} />

                                            <Button
                                                fullWidth
                                                sx={{
                                                    mt: 2,
                                                    py: 1,
                                                    borderRadius: "30px",
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    backgroundColor: websiteSettings.mainColor,
                                                    color: websiteSettings.textColor,
                                                }}
                                                onClick={() =>
                                                    handleEditClick(staffInfo?.[0]?.staffRollNumber)
                                                }
                                            >
                                                Edit Profile
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>



                            <Grid size={{ xs: 12, md: 8 }}>
                                <Grid container spacing={3} >
                                    <Grid size={{ xs: 12 }}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: "5px",
                                                background: "#fff",
                                                border: "1px solid #ccc",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 700, mb: 2 }}>
                                                Employment Overview
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <StatusTile
                                                    label="Employment"
                                                    value={staffStudentInfo?.[0]?.staffEmploymentStatus}
                                                />
                                                <StatusTile
                                                    label="Working"
                                                    value={staffStudentInfo?.[0]?.staffWorkingStatus}
                                                />
                                                <StatusTile
                                                    label="Experience"
                                                    value={staffStudentInfo?.[0]?.staffExperience}
                                                />
                                                <StatusTile
                                                    label="Income"
                                                    value={staffStudentInfo?.[0]?.staffIncome}
                                                />
                                                <StatusTile
                                                    label="Same School"
                                                    value={
                                                        staffStudentInfo?.[0]?.sameSchool === "yes"
                                                            ? "Yes"
                                                            : "No"
                                                    }
                                                    highlight
                                                />
                                            </Grid>
                                        </Box>
                                    </Grid>

                                    {staffStudentInfo?.[0]?.sameSchool === "yes" && (
                                        <Grid size={{ xs: 12 }} sx={{mb:3}}>
                                            <Box
                                                sx={{
                                                    height: "100%",
                                                    minHeight: "160px",
                                                    p: 2,
                                                    borderRadius: "5px",
                                                    background: "#fff",
                                                    border: "1px solid #ddd",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                                }}
                                            >
                                                <Typography sx={{ fontWeight: 700, mb: 2 }}>
                                                    Children Studying in Same School
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    {staffStudentInfo?.[0]?.staffStudentInfoChild?.map((child, index) => (
                                                        <Grid key={child.id} size={{ xs: 12, md: 6 }} sx={{ mb: 4 }}>
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    p: 2,
                                                                    borderRadius: "14px",
                                                                    background: "#fff",
                                                                    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                                                                    height: "100%",
                                                                    border: "1px solid #ddd",
                                                                }}
                                                            >
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 600 }}>
                                                                        Child {index + 1} - {child.rollNumber}
                                                                    </Typography>

                                                                    <Typography sx={{ fontSize: 13, color: "#666", pt: 0.5 }}>
                                                                        Student Type  {child.studentType}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: 13, color: "#666", pt: 0.5 }}>
                                                                        Siblings & Twins  {child.siblingsTwins}
                                                                    </Typography>
                                                                </Box>

                                                                <CheckCircleIcon sx={{ color: "#00c853" }} />
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>

                                            </Box>
                                        </Grid>
                                    )}

                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}