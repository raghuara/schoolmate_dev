import React, { useEffect, useRef, useState } from "react";
import { Box, Stepper, Step, StepLabel, Typography, IconButton, useMediaQuery, Grid, Button, FormLabel, RadioGroup, FormControlLabel, Radio, FormControl, Accordion, AccordionSummary, AccordionDetails, TextField, FormGroup, Checkbox, Autocomplete, Paper, Popper, InputAdornment, Dialog, TextareaAutosize, DialogContent, DialogActions, FormHelperText, Popover, Divider, Chip, Card, CardContent } from "@mui/material";
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const ChipRow = ({ label, value, icon: Icon }) => (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                my: { xs: 1, md: 1.5 },
                px: { xs: 1.5, md: 2 },
                py: { xs: 1, md: 1.2 },
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                border: "1px solid #e0e0e0",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateX(4px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderColor: "#bdbdbd"
                }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
                {Icon && <Icon sx={{ fontSize: { xs: 16, md: 18 }, color: "#666" }} />}
                <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: "#666", fontWeight: 500 }}>
                    {label}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 13, md: 14 }, fontWeight: 600, color: "#1a1a1a" }}>
                {value || "-"}
            </Typography>
        </Box>
    );

    const StatusTile = ({ label, value, highlight, icon: Icon }) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
                sx={{
                    height: "100%",
                    background: highlight
                        ? "linear-gradient(135deg, #00c853 0%, #69f0ae 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: highlight ? "#00c853" : "#e0e0e0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: highlight
                            ? "0 8px 24px rgba(0,200,83,0.3)"
                            : "0 4px 16px rgba(0,0,0,0.1)",
                    }
                }}
            >
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 }, mb: { xs: 0.5, md: 1 } }}>
                        {Icon && <Icon sx={{ fontSize: { xs: 18, md: 20 }, color: highlight ? "#fff" : "#666", opacity: 0.8 }} />}
                        <Typography sx={{ fontSize: { xs: 11, md: 12 }, opacity: 0.8, color: highlight ? "#fff" : "#666", fontWeight: 500 }}>
                            {label}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, md: 16 }, color: highlight ? "#fff" : "#1a1a1a" }}>
                        {value || "-"}
                    </Typography>
                </CardContent>
            </Card>
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

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        try {
            // TODO: Replace with actual delete API endpoint
            // await axios.delete(`/api/staff/${selectedRollNumber}`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });

            // Simulated API call - remove this and uncomment above in production
            await new Promise(resolve => setTimeout(resolve, 1000));

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Staff deleted successfully!");
            setDeleteDialogOpen(false);

            // Navigate back after successful deletion
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete staff!");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
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
            <Box sx={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
                borderRadius: { xs: "0", md: "12px 12px 0 0" },
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                borderBottom: "2px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",

            }}>
                <Grid container spacing={{ xs: 1, md: 2 }} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                bgcolor: "#fff",
                                border: "1px solid #e0e0e0",
                                width: { xs: "36px", md: "40px" },
                                height: { xs: "36px", md: "40px" },
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    bgcolor: "#f5f5f5",
                                    transform: "translateX(-4px)"
                                }
                            }}
                        >
                            <ArrowBackIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#000" }} />
                        </IconButton>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: { xs: "18px", md: "22px" }, color: "#1a1a1a" }}>
                                View Staff Details
                            </Typography>
                            <Typography sx={{ fontSize: { xs: "11px", md: "12px" }, color: "#666", mt: 0.5, display: { xs: "none", sm: "block" } }}>
                                Complete staff information and employment details
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{
                        display: "flex",
                        justifyContent: { xs: "start", md: "end" },
                        alignItems: "center",
                        gap: { xs: 1, md: 2 },
                        flexWrap: "wrap"
                    }}>
                        <Chip
                            icon={<CalendarTodayIcon sx={{ fontSize: { xs: 14, md: 16 } }} />}
                            label={`AY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                            sx={{
                                bgcolor: "#fff",
                                border: "1px solid #e0e0e0",
                                fontWeight: 600,
                                fontSize: { xs: "11px", md: "13px" },
                                height: { xs: "28px", md: "32px" }
                            }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon sx={{ fontSize: { xs: 16, md: 20 } }} />}
                            onClick={() => handleEditClick(staffInfo?.[0]?.staffRollNumber)}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                border: "1px solid #1976d2",
                                color: "#1976d2",
                                fontWeight: 600,
                                px: { xs: 1.5, md: 2 },
                                fontSize: { xs: "12px", md: "14px" },
                                minWidth: { xs: "60px", md: "auto" },
                                "&:hover": {
                                    bgcolor: "#e3f2fd",
                                    border: "1px solid #1565c0"
                                }
                            }}
                        >
                            {isMobile ? "" : "Edit"}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon sx={{ fontSize: { xs: 16, md: 20 } }} />}
                            onClick={handleDeleteClick}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                border: "1px solid #d32f2f",
                                color: "#d32f2f",
                                fontWeight: 600,
                                px: { xs: 1.5, md: 2 },
                                fontSize: { xs: "12px", md: "14px" },
                                minWidth: { xs: "60px", md: "auto" },
                                "&:hover": {
                                    bgcolor: "#ffebee",
                                    border: "1px solid #c62828"
                                }
                            }}
                        >
                            {isMobile ? "" : "Delete"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{
                maxHeight: "80vh",
                overflowY: "auto",
                bgcolor: "#f8f9fa",
                "&::-webkit-scrollbar": {
                    width: "8px"
                },
                "&::-webkit-scrollbar-track": {
                    bgcolor: "#f1f1f1"
                },
                "&::-webkit-scrollbar-thumb": {
                    bgcolor: "#bdbdbd",
                    borderRadius: "4px",
                    "&:hover": {
                        bgcolor: "#9e9e9e"
                    }
                }
            }}>
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Box>
                        <Grid
                            container
                            spacing={{ xs: 2, md: 3 }}
                        >
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box
                                    sx={{
                                        position: { xs: "relative", md: "sticky" },
                                        top: { xs: 0, md: "20px" },
                                    }}
                                >
                                    <Card
                                        sx={{
                                            borderRadius: "16px",
                                            overflow: "visible",
                                            border: "1px solid #e0e0e0",
                                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                            backgroundColor: "#fff",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                            }
                                        }}
                                    >
                                        {/* HEADER */}
                                        <Box
                                            sx={{
                                                height: { xs: 80, md: 120 },
                                                background: `linear-gradient(135deg, ${websiteSettings.mainColor} 0%, ${websiteSettings.mainColor}dd 100%)`,
                                                position: "relative",
                                                borderRadius: "16px 16px 0 0",
                                                zIndex: 1,
                                                "&::after": {
                                                    content: '""',
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: "40px",
                                                    background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)"
                                                }
                                            }}
                                        />

                                        {/* PROFILE IMAGE */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                mt: { xs: "-50px", md: "-60px" },
                                                position: "relative",
                                                zIndex: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: { xs: 100, md: 120 },
                                                    height: { xs: 100, md: 120 },
                                                    borderRadius: "50%",
                                                    border: { xs: "4px solid #fff", md: "5px solid #fff" },
                                                    overflow: "hidden",
                                                    backgroundColor: "#fff",
                                                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
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
                                        <CardContent sx={{ textAlign: "center", px: { xs: 2, md: 3 }, pb: 3, pt: { xs: 1.5, md: 2 } }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: { xs: 18, md: 20 }, color: "#1a1a1a", mb: 0.5 }}>
                                                {staffInfo?.[0]?.staffNameInEnglish}
                                            </Typography>

                                            <Chip
                                                icon={<WorkIcon sx={{ fontSize: { xs: 14, md: 16 } }} />}
                                                label={staffInfo?.[0]?.staffDesignation}
                                                sx={{
                                                    bgcolor: `${websiteSettings.mainColor}15`,
                                                    color: websiteSettings.mainColor,
                                                    fontWeight: 600,
                                                    fontSize: { xs: "11px", md: "12px" },
                                                    mb: { xs: 2, md: 3 },
                                                    border: `1px solid ${websiteSettings.mainColor}30`,
                                                    height: { xs: "26px", md: "32px" }
                                                }}
                                            />

                                            <Divider sx={{ mb: 2 }} />

                                            <Box sx={{ textAlign: "left" }}>
                                                <ChipRow
                                                    icon={BadgeIcon}
                                                    label="Roll No"
                                                    value={staffInfo?.[0]?.staffRollNumber}
                                                />
                                                <ChipRow
                                                    icon={PersonIcon}
                                                    label="Gender"
                                                    value={staffInfo?.[0]?.gender}
                                                />
                                                <ChipRow
                                                    icon={SchoolIcon}
                                                    label="Class"
                                                    value={`${staffInfo?.[0]?.grade}-${staffInfo?.[0]?.section}`}
                                                />
                                                <ChipRow
                                                    icon={CalendarTodayIcon}
                                                    label="Date Of Birth"
                                                    value={staffInfo?.[0]?.dateOfBirth}
                                                />
                                                {staffInfo?.[0]?.email && (
                                                    <ChipRow
                                                        icon={EmailIcon}
                                                        label="Email"
                                                        value={staffInfo?.[0]?.email}
                                                    />
                                                )}
                                                {staffInfo?.[0]?.phone && (
                                                    <ChipRow
                                                        icon={PhoneIcon}
                                                        label="Phone"
                                                        value={staffInfo?.[0]?.phone}
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Grid>



                            <Grid size={{ xs: 12, md: 8 }}>
                                <Grid container spacing={3} >
                                    <Grid size={{ xs: 12 }}>
                                        <Card
                                            sx={{
                                                borderRadius: "16px",
                                                border: "1px solid #e0e0e0",
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 }, mb: { xs: 2, md: 3 } }}>
                                                    <Box sx={{
                                                        width: { xs: 40, md: 48 },
                                                        height: { xs: 40, md: 48 },
                                                        borderRadius: "12px",
                                                        bgcolor: "#e3f2fd",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        border: "1px solid #90caf9"
                                                    }}>
                                                        <WorkIcon sx={{ fontSize: { xs: 20, md: 24 }, color: "#1976d2" }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, md: 18 }, color: "#1a1a1a" }}>
                                                            Employment Overview
                                                        </Typography>
                                                        <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: "#666" }}>
                                                            Professional work details and status
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Grid container spacing={2}>
                                                    <StatusTile
                                                        icon={WorkIcon}
                                                        label="Employment Status"
                                                        value={staffStudentInfo?.[0]?.staffEmploymentStatus}
                                                    />
                                                    <StatusTile
                                                        icon={BadgeIcon}
                                                        label="Working Status"
                                                        value={staffStudentInfo?.[0]?.staffWorkingStatus}
                                                    />
                                                    <StatusTile
                                                        icon={CalendarTodayIcon}
                                                        label="Experience"
                                                        value={staffStudentInfo?.[0]?.staffExperience}
                                                    />
                                                    <StatusTile
                                                        label="Monthly Income"
                                                        value={staffStudentInfo?.[0]?.staffIncome}
                                                    />
                                                    <StatusTile
                                                        icon={SchoolIcon}
                                                        label="Children in Same School"
                                                        value={
                                                            staffStudentInfo?.[0]?.sameSchool === "yes"
                                                                ? "Yes"
                                                                : "No"
                                                        }
                                                        highlight={staffStudentInfo?.[0]?.sameSchool === "yes"}
                                                    />
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {staffStudentInfo?.[0]?.sameSchool === "yes" && (
                                        <Grid size={{ xs: 12 }}>
                                            <Card
                                                sx={{
                                                    borderRadius: "16px",
                                                    border: "1px solid #e0e0e0",
                                                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 }, mb: { xs: 2, md: 3 } }}>
                                                        <Box sx={{
                                                            width: { xs: 40, md: 48 },
                                                            height: { xs: 40, md: 48 },
                                                            borderRadius: "12px",
                                                            bgcolor: "#e8f5e9",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            border: "1px solid #81c784"
                                                        }}>
                                                            <SchoolIcon sx={{ fontSize: { xs: 20, md: 24 }, color: "#00c853" }} />
                                                        </Box>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, md: 18 }, color: "#1a1a1a" }}>
                                                                Children Studying in Same School
                                                            </Typography>
                                                            <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: "#666" }}>
                                                                {staffStudentInfo?.[0]?.staffStudentInfoChild?.length || 0} {staffStudentInfo?.[0]?.staffStudentInfoChild?.length === 1 ? 'child' : 'children'} enrolled
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Grid container spacing={2}>
                                                        {staffStudentInfo?.[0]?.staffStudentInfoChild?.map((child, index) => (
                                                            <Grid key={child.id} size={{ xs: 12, md: 6 }}>
                                                                <Card
                                                                    sx={{
                                                                        height: "100%",
                                                                        borderRadius: "12px",
                                                                        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                                                                        border: "1px solid #e0e0e0",
                                                                        transition: "all 0.3s ease",
                                                                        "&:hover": {
                                                                            transform: "translateY(-4px)",
                                                                            boxShadow: "0 8px 20px rgba(0,200,83,0.15)",
                                                                            borderColor: "#00c853"
                                                                        }
                                                                    }}
                                                                >
                                                                    <CardContent sx={{ p: 2.5 }}>
                                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                                                            <Box>
                                                                                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", mb: 0.5 }}>
                                                                                    Child {index + 1}
                                                                                </Typography>
                                                                                <Chip
                                                                                    label={child.rollNumber}
                                                                                    size="small"
                                                                                    sx={{
                                                                                        bgcolor: "#e8f5e9",
                                                                                        color: "#00c853",
                                                                                        fontWeight: 600,
                                                                                        fontSize: "11px",
                                                                                        height: "24px"
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                            <CheckCircleIcon sx={{ color: "#00c853", fontSize: 28 }} />
                                                                        </Box>

                                                                        <Divider sx={{ my: 1.5 }} />

                                                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                                <PersonIcon sx={{ fontSize: 16, color: "#666" }} />
                                                                                <Typography sx={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                                                                                    Student Type:
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
                                                                                    {child.studentType}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                                <SchoolIcon sx={{ fontSize: 16, color: "#666" }} />
                                                                                <Typography sx={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                                                                                    Siblings & Twins:
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
                                                                                    {child.siblingsTwins}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}

                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                    }
                }}
            >
                <DialogContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "#ffebee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            border: "4px solid #ffcdd2"
                        }}
                    >
                        <DeleteIcon sx={{ fontSize: 40, color: "#d32f2f" }} />
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#1a1a1a", mb: 1.5 }}>
                        Delete Staff Member?
                    </Typography>

                    <Typography sx={{ fontSize: 14, color: "#666", mb: 1, lineHeight: 1.6 }}>
                        Are you sure you want to delete{" "}
                        <strong>{staffInfo?.[0]?.staffNameInEnglish}</strong>?
                    </Typography>

                    <Typography sx={{ fontSize: 13, color: "#d32f2f", fontWeight: 600 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0, gap: 2, justifyContent: "center" }}>
                    <Button
                        onClick={handleDeleteCancel}
                        disabled={deleteLoading}
                        sx={{
                            textTransform: "none",
                            borderRadius: "10px",
                            px: 4,
                            py: 1.2,
                            fontWeight: 600,
                            border: "1px solid #e0e0e0",
                            color: "#666",
                            minWidth: "120px",
                            "&:hover": {
                                bgcolor: "#f5f5f5",
                                border: "1px solid #bdbdbd"
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        disabled={deleteLoading}
                        sx={{
                            textTransform: "none",
                            borderRadius: "10px",
                            px: 4,
                            py: 1.2,
                            fontWeight: 600,
                            bgcolor: "#d32f2f",
                            color: "#fff",
                            minWidth: "120px",
                            "&:hover": {
                                bgcolor: "#c62828"
                            },
                            "&:disabled": {
                                bgcolor: "#ffcdd2",
                                color: "#fff"
                            }
                        }}
                    >
                        {deleteLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}