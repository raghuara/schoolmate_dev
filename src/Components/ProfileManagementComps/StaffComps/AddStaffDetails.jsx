import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, useMediaQuery, Grid, Button, FormLabel, RadioGroup, FormControlLabel, Radio, FormControl, Accordion, AccordionSummary, AccordionDetails, TextField, FormGroup, Checkbox, Autocomplete, Paper, Popper, InputAdornment, Dialog, TextareaAutosize, DialogContent, DialogActions, FormHelperText, Popover, Chip } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { DASH, RADIUS, PageHeader } from "../../DashBoardComps/dashboardTheme";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDropzone } from "react-dropzone";
import { Textarea } from "@mui/joy";
import { getUsersByUserType, postStaffInformation, postStaffStudentInformation, postStudentAcademicInformation, postStudentDocumentInformation, postStudentFamilyInformation, postStudentgeneralhealthInformation, postStudentGuardianInformation, postStudentInformation, postStudentSiblingInformation } from "../../../Api/Api";
import axios from "axios";
import DropDownList from "../../DropdownList";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import TamilKeyboard from "../../Tools/TamilKeyBoardLayout";
import { apiErrorMessage, responseErrorMessage } from "../../../Api/apiError";


const SECTIONS = [
    { key: "staff", label: "Staff Info", requires: null },
    { key: "employment", label: "Employment & Family Info", requires: "staff" },
];

const sectionOf = (key) => SECTIONS.find((item) => item.key === key);

export default function AddStaffDetails() {
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
    const academicYear = useSelector(selectAcademicYear);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [count, setCount] = useState(0);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [changesHappended, setChangesHappended] = useState(false);
    const [fileType, setFileType] = useState('');
    const [isLoading, setIsLoading] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [medication, setMedication] = useState("");
    const [medicationDescription, setMedicationDescription] = useState("");
    const [allergiesDescription, setAllergiesDescription] = useState("");
    const [allergies, setAllergies] = useState("");
    const [openTextarea, setOpenTextarea] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [openPreviewImage, setOpenPreviewImage] = useState(false);

    const [fetchRollNumber, setFetchRollNumber] = useState("");

    const [applicationNo, setApplicationNo] = useState("");
    const [admissionNo, setAdmissionNo] = useState("");

    const [birthCertificateNo, setBirthCertificateNo] = useState("");
    const [selectedGradeId, setSelectedGradeId] = useState("");
    const [selectedSiblingClass, setSelectedSiblingClass] = useState("");
    const [selectedSection, setSelectedSection] = useState(null);
    const [aadharNo, setAadharNo] = useState("");
    const [emisNo, setEmisNo] = useState("");

    const [rchIdOrPicmeNumber, setRchIdOrPicmeNumber] = useState("");
    const [originalCertificateReceived, setOriginalCertificateReceived] = useState("");
    const [rteStudent, setRteStudent] = useState("");

    const [religion, setReligion] = useState("");
    const [community, setCommunity] = useState("");
    const [motherTongue, setMotherTongue] = useState("");

    const [previousSchool, setPreviousSchool] = useState("");
    const [previousBoard, setPreviousBoard] = useState("");
    const [mediumOfInstruction, setMediumOfInstruction] = useState("");
    const [secondLanguage, setSecondLanguage] = useState("");
    const [residentialAddress, setResidentialAddress] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");




    const [isDisabledAcademic, setIsDisabledAcademic] = useState(false);
    const [isDisabledStaffInfo, setIsDisabledStaffInfo] = useState(false);
    const [openSection, setOpenSection] = useState("staff");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [childrensStudyingInSameSchool, setChildrensStudyingInSameSchool] = useState('No');
    const [studentType, setStudentType] = useState('');
    const [siblingsTwins, setSiblingsTwins] = useState('');

    const selectedGrade = grades.find((grade) => grade.sign === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];

    const selectedClass = grades.find((grade) => grade.sign === selectedSiblingClass);
    const siblingSections = selectedClass?.sections.map((section) => ({ sectionName: section })) || [];
    const [studyingInSameSchool, setStudyingInSameSchool] = useState("No");
    const [studentsList, setStudentsList] = useState([]);
    const MAX_CHILDREN = 5;
    const [children, setChildren] = useState([
        {
            id: 1,
            rollNumber: "",
            childrenName: "",
            studentType: "",
            siblingsTwins: "",
        },
    ]);


    const [staffNameEnglish, setStaffNameEnglish] = useState("");
    const [staffNameTamil, setStaffNameTamil] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [gender, setGender] = useState("");
    const [admissionClass, setAdmissionClass] = useState("");
    const [section, setSection] = useState("");
    const [staffCategory, setStaffCategory] = useState("");
    const [selectedUserType, setSelectedUserType] = useState("");
    const [staffDesignation, setStaffDesignation] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [profileImageError, setProfileImageError] = useState("");

    const [dateOfJoining, setDateOfJoining] = useState(null);
    const [staffRollNumber, setStaffRollNumber] = useState("");
    const [employmentStatus, setEmploymentStatus] = useState("");
    const [workingStatus, setWorkingStatus] = useState("");
    const [staffExperience, setStaffExperience] = useState("");
    const [staffIncome, setStaffIncome] = useState("");

    const [value, setValue] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
    }, [value]);

    useEffect(() => {
        if (studyingInSameSchool === "yes") {
            const fetchStudents = async () => {
                try {
                    const res = await axios.get(getUsersByUserType, {
                        params: { userType: "student" },
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const flattened = (res.data.data || []).flatMap((g) => g.users || []);
                    setStudentsList(flattened);
                } catch (error) {
                    setStudentsList([]);
                    showError(apiErrorMessage(error, "Could not load the student list."));
                }
            };
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studyingInSameSchool]);

    const handleStudyingChange = (event) => {
        const value = event.target.value;
        setStudyingInSameSchool(value);

        if (value === "no") {
            setChildren([
                {
                    id: 1,
                    rollNumber: "",
                    childrenName: "",
                    studentType: "",
                    siblingsTwins: "",
                },
            ]);
            nextId.current = 2;
        }
    };


    const designationOptions = {
        "Teaching Staff": ["Teacher"],
        "Non Teaching Staff": ["Accountant", "Librarian", "Clerk", "Billing Staff"],
        "Supporting Staff": ["Cleaner", "Helper", "Driver", "Sweeper", "Security",],
    };

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };
    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.sign);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId("");
            setSelectedSection(null);
        }
    };

    const addChildren = () => {
        if (children.length >= MAX_CHILDREN) return;

        const newChild = {
            id: nextId.current++,
            rollNumber: "",
            childrenName: "",
            studentType: "",
            siblingsTwins: "",
        };

        setChildren((prev) => [...prev, newChild]);
    };

    const removeChildren = (id) => {
        setChildren((prev) => prev.filter((child) => child.id !== id));
    };

    const updateChildField = (id, field, value) => {
        setChildren((prev) =>
            prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        );
    };

    const themeColor = websiteSettings.mainColor || "#E60154";

    const savedSections = {
        staff: isDisabledStaffInfo,
        employment: isDisabledAcademic,
    };

    const savedCount = SECTIONS.filter((item) => savedSections[item.key]).length;

    const notify = (text, ok) => {
        setMessage(text);
        setColor(ok);
        setStatus(ok);
        setOpen(true);
    };

    const showError = (text) => notify(text, false);
    const showSuccess = (text) => notify(text, true);

    const blockingSection = (key) => {
        const requires = sectionOf(key)?.requires;
        if (!requires) return null;
        return savedSections[requires] ? null : sectionOf(requires);
    };

    const nextSectionAfter = (savedKey) => {
        const saved = { ...savedSections, [savedKey]: true };
        const next = SECTIONS.find((item) => !saved[item.key] && (!item.requires || saved[item.requires]));
        return next ? next.key : "";
    };

    const handleSectionToggle = (key) => (event, expanded) => {
        const blocker = blockingSection(key);
        if (blocker) {
            showError(`Save ${blocker.label} before filling ${sectionOf(key).label}`);
            return;
        }
        setOpenSection(expanded ? key : "");
    };

    const requireSectionUnlocked = (key) => {
        const blocker = blockingSection(key);
        if (!blocker) return true;
        showError(`Save ${blocker.label} before saving ${sectionOf(key).label}`);
        return false;
    };

    const renderSectionSummary = (key, index) => {
        const section = sectionOf(key);
        const blocker = blockingSection(key);
        const locked = Boolean(blocker);
        const saved = savedSections[key];
        const badgeBg = saved ? "#E8F5E9" : locked ? "#EEF0F3" : `${themeColor}1A`;
        const badgeColor = saved ? "#2E7D32" : locked ? "#9CA3AF" : themeColor;

        return (
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: locked ? "#C4C8CE" : "#6B7280" }} />}
                aria-controls={`${key}-content`}
                id={`${key}-header`}
                sx={{
                    backgroundColor: locked ? "#F9FAFB" : "#fff7f7",
                    py: 0.5,
                    position: "relative",
                    cursor: locked ? "not-allowed" : "pointer",
                    "& .MuiAccordionSummary-content": {
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        flexWrap: "wrap",
                        pr: 1,
                    },
                }}
            >
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        bgcolor: badgeBg,
                        color: badgeColor,
                        flexShrink: 0,
                    }}
                >
                    {saved
                        ? <CheckCircleIcon sx={{ fontSize: 17 }} />
                        : locked
                            ? <LockOutlinedIcon sx={{ fontSize: 14 }} />
                            : index}
                </Box>
                <Typography
                    component="span"
                    sx={{ fontWeight: 600, fontSize: "14.5px", color: locked ? "#9CA3AF" : "#111827" }}
                >
                    {section.label}
                </Typography>
                {saved && (
                    <Chip
                        size="small"
                        label="Saved"
                        sx={{ height: 21, fontSize: "10.5px", fontWeight: 700, bgcolor: "#E8F5E9", color: "#2E7D32" }}
                    />
                )}
                {locked && (
                    <Chip
                        size="small"
                        label={`Save ${blocker.label} first`}
                        sx={{ height: 21, fontSize: "10.5px", fontWeight: 600, bgcolor: "#EEF0F3", color: "#6B7280" }}
                    />
                )}
            </AccordionSummary>
        );
    };

    const handleAcademicSubmit = async (status) => {
        if (!staffNameEnglish.trim()) {
            setMessage("Staff name in English is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (!dateOfBirth || !dateOfBirth.trim()) {
            setMessage("Date of birth is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (!gender || !gender.trim()) {
            setMessage("Gender is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (!staffRollNumber.trim()) {
            setMessage("Staff roll number is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!selectedUserType) {
            setMessage("User type is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!staffCategory) {
            setMessage("Staff category is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!staffDesignation) {
            setMessage("Staff designation is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!dateOfJoining) {
            setMessage("Date of joining is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!academicYear) {
            setMessage("Academic year is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("requestedByRollNumber", RollNumber);
            formData.append("creatorRollNumber", RollNumber);
            formData.append("staffRollNumber", staffRollNumber);
            formData.append("staffNameInEnglish", staffNameEnglish);
            formData.append("staffNameInTamil", staffNameTamil);
            formData.append("dateOfBirth", dateOfBirth);
            formData.append("gender", gender);
            formData.append("admissionClass", selectedGradeId);
            formData.append("section", selectedSection || "");
            formData.append("staffCategory", staffCategory);
            formData.append("userType", selectedUserType);
            formData.append("staffDesignation", staffDesignation);
            formData.append("dateofJoining", dateOfJoining);
            formData.append("academicYear", academicYear);
            if (profileImage) {
                formData.append("staffPassportSizePhotofiletype", "image");
                formData.append("passportSizePhotofile", profileImage);
            }


            const res = await axios.post(postStaffInformation, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const failedMessage = responseErrorMessage(res, `Roll number ${staffRollNumber} could not be created.`);
            if (failedMessage) {
                showError(failedMessage);
                setFetchRollNumber("");
                return;
            }

            showSuccess(`Staff created successfully with roll number ${staffRollNumber}.`);
            setFetchRollNumber(staffRollNumber);
            setIsDisabledStaffInfo(true);
            setOpenSection(nextSectionAfter("staff"));
        } catch (error) {
            showError(apiErrorMessage(error, "Could not create this staff member. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };


    const handleAcademicClear = () => {
        setStaffRollNumber("");
        setStaffNameEnglish("");
        setStaffNameTamil("");
        setDateOfBirth(null);
        setGender("");
        setSelectedGradeId("");
        setSelectedSection(null);
        setStaffCategory("");
        setStaffDesignation("");
        setDateOfJoining(null);
        setProfileImage(null);
        setProfileImagePreview("");
        setProfileImageError("");
    }


    const handleStaffSubmit = async (status) => {
        if (!requireSectionUnlocked("employment")) return;

        if (!employmentStatus.trim()) {
            setMessage("Staff Employment Status is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!workingStatus.trim()) {
            setMessage("Staff Working Status is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!staffExperience.trim()) {
            setMessage("Staff Experience is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!staffIncome.trim()) {
            setMessage("Staff Income is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (studyingInSameSchool === "yes") {
            if (!children.length) {
                setMessage("Please add at least one child studying in this school");
                setOpen(true);
                setColor(false);
                setStatus(false);
                return;
            }

            const invalidChild = children.some((child) =>
                !child.rollNumber.trim() ||
                !child.studentType ||
                (children.length > 1 && !child.siblingsTwins)
            );

            if (invalidChild) {
                setMessage("Please fill all required children details");
                setOpen(true);
                setColor(false);
                setStatus(false);
                return;
            }
        }

        setIsLoading(true);
        try {
            const formattedChildren =
                studyingInSameSchool === "yes"
                    ? children.map((child) => ({
                        rollNumber: child.rollNumber.trim(),
                        studentType: child.studentType,
                        siblingsTwins: children.length > 1 ? child.siblingsTwins : null,
                    }))
                    : [];

            const sendData = {
                requestedByRollNumber: RollNumber,
                creatorRollNumber: RollNumber,
                staffRollNumber: staffRollNumber || fetchRollNumber,
                staffEmploymentStatus: employmentStatus,
                staffWorkingStatus: workingStatus,
                staffExperience: staffExperience,
                staffIncome: staffIncome,
                sameSchool: studyingInSameSchool === "yes" ? "Y" : "N",
                children: formattedChildren,
            };

            const res = await axios.post(postStaffStudentInformation, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const failedMessage = responseErrorMessage(res);
            if (failedMessage) {
                showError(failedMessage);
                return;
            }

            showSuccess("Staff profile completed successfully.");
            setIsDisabledAcademic(true);
            setOpenSection("");
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        } catch (error) {
            showError(apiErrorMessage(error, "Could not save the employment details. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStaffClear = () => {
        setEmploymentStatus("");
        setWorkingStatus("");
        setStaffExperience("");
        setStaffIncome("");
        setStudyingInSameSchool("no");
        setChildren([
            {
                id: 1,
                rollNumber: "",
                childrenName: "",
                studentType: "",
                siblingsTwins: "",
            },
        ]);

        nextId.current = 2;
    };


    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box
                sx={{
                    px: { xs: 1.5, md: 3 },
                    pt: { xs: 1.5, md: 2 },
                    bgcolor: DASH.canvas,
                    borderBottom: `1px solid ${DASH.line}`,
                }}
            >
                <PageHeader
                    title="Create Staff Details"
                    subtitle="Add a new staff profile step by step"
                    onBack={() => navigate(-1)}
                    right={(
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.8,
                                height: 36,
                                px: 1.5,
                                borderRadius: RADIUS,
                                bgcolor: "#fff",
                                border: `1px solid ${DASH.line}`,
                            }}
                        >
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: DASH.faint }} />
                            <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.muted }}>
                                Academic Year
                            </Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                                {academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                            </Typography>
                        </Box>
                    )}
                />
            </Box>
            <Box sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Box sx={{ px: 2, pt: 1.5 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, md: 2 },
                            flexWrap: "wrap",
                            px: 1.5,
                            py: 0.75,
                            bgcolor: "#fff",
                            border: `1px solid ${DASH.line}`,
                            borderRadius: RADIUS,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            {SECTIONS.map((item, index) => {
                                const locked = Boolean(blockingSection(item.key));
                                const saved = savedSections[item.key];
                                const active = !saved && !locked;
                                return (
                                    <React.Fragment key={item.key}>
                                        {index > 0 && (
                                            <Box
                                                sx={{
                                                    width: { xs: 14, md: 28 },
                                                    height: "2px",
                                                    borderRadius: "2px",
                                                    bgcolor: saved || active ? `${themeColor}66` : DASH.line,
                                                }}
                                            />
                                        )}
                                        <Box
                                            onClick={() => handleSectionToggle(item.key)(null, true)}
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.75,
                                                height: 28,
                                                pl: 0.5,
                                                pr: { xs: 0.75, sm: 1.25 },
                                                borderRadius: "999px",
                                                cursor: locked ? "not-allowed" : "pointer",
                                                border: `1px solid ${saved ? "#CDE9D6" : active ? `${themeColor}59` : DASH.line}`,
                                                bgcolor: saved ? DASH.greenLight : active ? `${themeColor}14` : DASH.lineSoft,
                                                transition: "box-shadow 0.2s ease, background-color 0.2s ease",
                                                "&:hover": { boxShadow: locked ? "none" : "0 1px 6px rgba(17,24,39,0.10)" },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                    bgcolor: saved ? DASH.green : active ? themeColor : "#fff",
                                                    border: locked ? `1px solid ${DASH.line}` : "none",
                                                    color: locked ? DASH.faint : "#fff",
                                                }}
                                            >
                                                {saved
                                                    ? <CheckRoundedIcon sx={{ fontSize: 13 }} />
                                                    : locked
                                                        ? <LockOutlinedIcon sx={{ fontSize: 11 }} />
                                                        : <Typography sx={{ fontSize: "11px", fontWeight: 700, lineHeight: 1 }}>{index + 1}</Typography>}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "11px", md: "12px" },
                                                    fontWeight: saved || active ? 700 : 600,
                                                    color: saved ? "#2E7D32" : active ? DASH.ink : DASH.faint,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {isMobile ? `Step ${index + 1}` : item.label}
                                            </Typography>
                                        </Box>
                                    </React.Fragment>
                                );
                            })}
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        {fetchRollNumber ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                <BadgeOutlinedIcon sx={{ fontSize: 15, color: DASH.green }} />
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, display: { xs: "none", md: "block" } }}>
                                    Roll number&nbsp;
                                    <Box component="span" sx={{ fontWeight: 700, color: DASH.ink }}>{fetchRollNumber}</Box>
                                    &nbsp;- continue with employment details
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                <LockOutlinedIcon sx={{ fontSize: 14, color: DASH.faint }} />
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, display: { xs: "none", md: "block" } }}>
                                    Save Staff Info to unlock employment &amp; family details
                                </Typography>
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                pl: { xs: 0, md: 1.5 },
                                borderLeft: { xs: "none", md: `1px solid ${DASH.lineSoft}` },
                            }}
                        >
                            <Box sx={{ width: 56, height: 4, borderRadius: "999px", bgcolor: DASH.lineSoft, overflow: "hidden" }}>
                                <Box
                                    sx={{
                                        width: `${(savedCount / SECTIONS.length) * 100}%`,
                                        height: "100%",
                                        borderRadius: "999px",
                                        bgcolor: themeColor,
                                        transition: "width 0.3s ease",
                                    }}
                                />
                            </Box>
                            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, whiteSpace: "nowrap" }}>
                                {savedCount}/{SECTIONS.length} saved
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Box pt={1}>
                        <Accordion
                            sx={{ boxShadow: "none" }}
                            expanded={openSection === "staff"}
                            onChange={handleSectionToggle("staff")}
                        >
                            {renderSectionSummary("staff", 1)}
                            <AccordionDetails>
                                <Grid container columnSpacing={3} pb={1}>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                        <Typography sx={{ fontSize: "12px" }} component="span">Staff Name In English<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                        <TextField
                                            disabled={isDisabledStaffInfo}
                                            id="outlined-size-small"
                                            size="small"
                                            value={staffNameEnglish}
                                            onChange={(e) => {
                                                const inputValue = e.target.value.replace(/[^A-Za-z\s]/g, "").slice(0, 25);
                                                setStaffNameEnglish(inputValue);
                                            }}
                                            inputProps={{
                                                maxLength: 25,
                                                pattern: "[A-Za-z ]*"
                                            }}
                                            sx={{ mt: 0.5 }}
                                        />

                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px" }} component="span">Staff Name In Tamil</Typography><br />
                                            <TextField
                                                disabled={isDisabledStaffInfo}
                                                size="small"
                                                value={staffNameTamil}
                                                onChange={(e) => {
                                                    const inputValue = e.target.value.replace(/[^A-Za-z\s]/g, "").slice(0, 25);
                                                    setStaffNameTamil(inputValue);
                                                }}
                                                inputRef={inputRef}
                                                inputProps={{
                                                    maxLength: 25,
                                                    style: {
                                                        whiteSpace: "nowrap",
                                                        overflowX: "auto"
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton disabled={isDisabledStaffInfo} onClick={(e) => setAnchorEl(e.currentTarget)}>
                                                                <KeyboardIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={{ mt: 0.7, width: "100%" }}
                                            />

                                            <Popover
                                                open={Boolean(anchorEl)}
                                                anchorEl={anchorEl}
                                                onClose={() => setAnchorEl(null)}
                                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                            >
                                                <TamilKeyboard value={staffNameTamil} setValue={setStaffNameTamil} inputRef={inputRef} />
                                            </Popover>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                        <Typography sx={{ fontSize: "12px" }} component="span">Date Of Birth<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                disabled={isDisabledStaffInfo}
                                                value={dateOfBirth ? dayjs(dateOfBirth, "DD-MM-YYYY") : null}
                                                onChange={(newValue) => {
                                                    setDateOfBirth(newValue ? newValue.format("DD-MM-YYYY") : "");
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        sx: { mt: 0.5 }
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px" }} component="span">Gender<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                            <Autocomplete
                                                disabled={isDisabledStaffInfo}
                                                disablePortal
                                                options={["Male", "Female"]}
                                                value={gender}
                                                onChange={(event, newValue) => setGender(newValue || "")}
                                                sx={{ width: "100%", mt: 0.5 }}
                                                PopperComponent={(props) => (
                                                    <Popper {...props} modifiers={[{ name: "preventOverflow", options: { boundary: "window" } }]} />
                                                )}
                                                componentsProps={{
                                                    popper: {
                                                        sx: {
                                                            maxHeight: "180px",
                                                            overflowY: "auto",
                                                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
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
                                                        fullWidth
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: {
                                                                paddingRight: 0,
                                                                height: "41px",
                                                                fontSize: "14px",
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />

                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px" }} component="span">Roll Number<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                            <TextField
                                                disabled={isDisabledStaffInfo}
                                                id="outlined-size-small"
                                                size="small"
                                                value={staffRollNumber}
                                                onChange={(e) => setStaffRollNumber(e.target.value)}
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px" }} component="span">Admission Class</Typography><br />
                                            <Autocomplete
                                                disabled={isDisabledStaffInfo}
                                                disablePortal
                                                options={grades}
                                                getOptionLabel={(option) => option.sign}
                                                value={grades.find((item) => item.sign === selectedGradeId) || null}
                                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                sx={{ width: "100%", mt: 0.5 }}
                                                PopperComponent={(props) => (
                                                    <Popper {...props} modifiers={[{ name: "preventOverflow", options: { boundary: "window" } }]} />
                                                )}
                                                componentsProps={{
                                                    popper: {
                                                        sx: {
                                                            maxHeight: "180px",
                                                            overflowY: "auto",
                                                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
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
                                                        fullWidth
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: {
                                                                paddingRight: 0,
                                                                height: "41px",
                                                                width: "100%",
                                                                fontSize: "14px",
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />

                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px" }} component="span">Section</Typography><br />
                                            <Autocomplete
                                                disabled={isDisabledStaffInfo}
                                                disablePortal
                                                fullWidth
                                                options={sections}
                                                getOptionLabel={(option) => option.sectionName}
                                                value={sections.find((option) => option.sectionName === selectedSection) || null}
                                                onChange={handleSectionChange}
                                                isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                                sx={{ width: "100%", mt: 0.5 }}
                                                PopperComponent={(props) => (
                                                    <Popper {...props} modifiers={[{ name: "preventOverflow", options: { boundary: "window" } }]} />
                                                )}
                                                componentsProps={{
                                                    popper: {
                                                        sx: {
                                                            maxHeight: "180px",
                                                            overflowY: "auto",
                                                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
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
                                                        fullWidth
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: {
                                                                paddingRight: 0,
                                                                height: "41px",
                                                                fontSize: "14px",
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />

                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">User Type<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                            <Autocomplete
                                                disabled={isDisabledStaffInfo}
                                                disablePortal
                                                size="small"
                                                options={["Admin", "Staff", "Teacher"]}
                                                value={selectedUserType || null}
                                                onChange={(event, newValue) => {
                                                    setSelectedUserType(newValue || "");
                                                }}
                                                sx={{ width: "100%", mt: 0.5 }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 41,
                                                                fontSize: 14,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Staff Category<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                            <Autocomplete
                                                disabled={isDisabledStaffInfo}
                                                disablePortal
                                                options={["Teaching Staff", "Non Teaching Staff", "Supporting Staff"]}
                                                value={staffCategory}
                                                onChange={(event, newValue) => {
                                                    setStaffCategory(newValue || "");
                                                    setStaffDesignation("");
                                                }}
                                                sx={{ width: "100%", mt: 0.5 }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 41,
                                                                fontSize: 14,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Staff Designation<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                            <Autocomplete
                                                disabled={isDisabledStaffInfo}
                                                disablePortal
                                                options={designationOptions[staffCategory] || []}
                                                value={staffDesignation}
                                                onChange={(event, newValue) => setStaffDesignation(newValue || "")}
                                                sx={{ width: "100%", mt: 0.5 }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 41,
                                                                fontSize: 14,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                        <Typography sx={{ fontSize: "12px" }} component="span">Date Of Joining<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                disabled={isDisabledStaffInfo}
                                                value={dateOfJoining ? dayjs(dateOfJoining, "DD-MM-YYYY") : null}
                                                onChange={(newValue) => {
                                                    setDateOfJoining(newValue ? newValue.format("DD-MM-YYYY") : null);
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        sx: { mt: 0.5 }
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>

                                    {/* Profile */}
                                    <Grid
                                        size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }}
                                        sx={{ display: "flex", justifyContent: "center", pt: 1 }}
                                    >
                                        <Box sx={{ width: "100%" }}>
                                            <Typography sx={{ fontSize: "12px" }} component="span">
                                                Upload Profile image
                                            </Typography>
                                            <br />

                                            <input
                                                accept="image/*"
                                                id="profile-image-input"
                                                type="file"
                                                style={{ display: "none", }}
                                                disabled={isDisabledStaffInfo}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    const maxBytes = 2 * 1024 * 1024;
                                                    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

                                                    if (!allowedTypes.includes(file.type)) {
                                                        setProfileImage(null);
                                                        setProfileImagePreview("");
                                                        setProfileImageError("Only JPG, PNG or WEBP files are allowed");
                                                        e.target.value = "";
                                                        return;
                                                    }
                                                    if (file.size > maxBytes) {
                                                        setProfileImage(null);
                                                        setProfileImagePreview("");
                                                        setProfileImageError("File too large — max 2 MB");
                                                        e.target.value = "";
                                                        return;
                                                    }

                                                    setProfileImageError("");
                                                    setProfileImage(file);

                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        setProfileImagePreview(ev.target.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                            />

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>

                                                <label htmlFor="profile-image-input" style={{ width: "100%" }}>
                                                    <Button
                                                        component="span"
                                                        disabled={isDisabledStaffInfo}
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ height: "41px", justifyContent: "flex-start", textTransform: "none", borderColor: "#000", color: "#000" }}
                                                    >
                                                        {profileImagePreview ? "Change Image" : "Choose Image"}
                                                    </Button>
                                                </label>

                                                {profileImagePreview ? (
                                                    <Box
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: "6px",
                                                            overflow: "hidden",
                                                            boxShadow: 1,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <img
                                                            src={profileImagePreview}
                                                            alt="preview"
                                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                                        />
                                                    </Box>
                                                ) : null}

                                                {profileImagePreview ? (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setProfileImage(null);
                                                            setProfileImagePreview("");
                                                            setProfileImageError("");
                                                            const input = document.getElementById("profile-image-input");
                                                            if (input) input.value = "";
                                                        }}
                                                        disabled={isDisabledStaffInfo}
                                                        aria-label="remove image"
                                                        sx={{ ml: 0.5 }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                ) : null}
                                            </Box>

                                            <FormHelperText error={!!profileImageError} sx={{ mt: 0.5, pb: 2 }}>
                                                {profileImageError || "Max size 2 MB. JPG / PNG / WEBP"}
                                            </FormHelperText>
                                        </Box>
                                    </Grid>


                                    <Box sx={{ position: "absolute", bottom: "10px", right: "10px" }}>
                                        {!isDisabledStaffInfo &&
                                            <>
                                                <Button onClick={handleAcademicClear} sx={{ textTransform: "none", color: "#6B7280", py: 0.4, fontSize: "12.5px", fontWeight: 600, px: 2.2, mr: 1, borderRadius: "20px", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" } }}>
                                                    Clear
                                                </Button>
                                                <Button onClick={handleAcademicSubmit} disableElevation variant="contained" sx={{ textTransform: "none", color: "#fff", py: 0.4, px: 3, fontSize: "12.5px", fontWeight: 700, borderRadius: "20px", backgroundColor: themeColor, boxShadow: `0 6px 14px ${themeColor}33`, "&:hover": { backgroundColor: themeColor, filter: "brightness(0.92)", boxShadow: `0 8px 18px ${themeColor}45` } }}>
                                                    Save
                                                </Button>
                                            </>
                                        }
                                        {isDisabledStaffInfo &&
                                            <Box sx={{ fontSize: "12.5px", color: "#2E7D32", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#E8F5E9", borderRadius: "20px", px: 1.6, py: 0.5 }}><CheckCircleIcon style={{ fontSize: "17px" }} /> Saved</Box>
                                        }
                                    </Box>

                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Box sx={{ mt: 2 }}>
                            <Accordion
                                sx={{ boxShadow: "none" }}
                                expanded={openSection === "employment"}
                                onChange={handleSectionToggle("employment")}
                            >
                                {renderSectionSummary("employment", 2)}
                                <AccordionDetails>
                                    <Grid container pb={2} columnSpacing={3}>

                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                            <Box sx={{ width: "100%" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Staff Employment Status<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                                <Autocomplete
                                                    disablePortal
                                                    options={["Permanent", "Temporary", "Contractual"]}
                                                    value={employmentStatus}
                                                    onChange={(event, newValue) => {
                                                        setEmploymentStatus(newValue || "");
                                                    }}
                                                    sx={{ width: "100%", mt: 0.5 }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            sx={{
                                                                "& .MuiInputBase-root": {
                                                                    height: 41,
                                                                    fontSize: 14,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                            <Box sx={{ width: "100%" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Staff Working Status<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                                <Autocomplete
                                                    disablePortal
                                                    options={["Active staff", "Alumni staff", "New staff"]}
                                                    value={workingStatus}
                                                    onChange={(event, newValue) => {
                                                        setWorkingStatus(newValue || "");
                                                    }}
                                                    sx={{ width: "100%", mt: 0.5 }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            sx={{
                                                                "& .MuiInputBase-root": {
                                                                    height: 41,
                                                                    fontSize: 14,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                            <Box sx={{ width: "100%" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Staff Experience<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                                <Autocomplete
                                                    disablePortal
                                                    options={[
                                                        "Fresher",
                                                        "1 Year",
                                                        "2 Years",
                                                        "3 Years",
                                                        "4 Years",
                                                        "5 Years",
                                                        "6-10 Years",
                                                        "10-15 Years",
                                                        "15+ Years"
                                                    ]
                                                    }
                                                    value={staffExperience}
                                                    onChange={(event, newValue) => {
                                                        setStaffExperience(newValue || "");
                                                    }}
                                                    sx={{ width: "100%", mt: 0.5 }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            sx={{
                                                                "& .MuiInputBase-root": {
                                                                    height: 41,
                                                                    fontSize: 14,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: "flex", justifyContent: "center", pt: 1 }} >
                                            <Box sx={{ width: "100%" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Staff Income<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                                <Autocomplete
                                                    disablePortal
                                                    options={[
                                                        "Below ₹10,000",
                                                        "₹10,000 - ₹15,000",
                                                        "₹15,000 - ₹20,000",
                                                        "₹20,000 - ₹25,000",
                                                        "₹25,000 - ₹30,000",
                                                        "₹30,000 - ₹40,000",
                                                        "₹40,000 - ₹50,000",
                                                        "₹50,000 - ₹75,000",
                                                        "₹75,000 - ₹1,00,000",
                                                        "Above ₹1,00,000",
                                                    ]}
                                                    value={staffIncome}
                                                    onChange={(event, newValue) => setStaffIncome(newValue || "")}
                                                    sx={{ width: "100%", mt: 0.5 }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            sx={{
                                                                "& .MuiInputBase-root": {
                                                                    height: 41,
                                                                    fontSize: 14,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />

                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1, px: 1 }}  >
                                            <Box>
                                                <Typography sx={{ fontSize: "12px" }}>Child in Same School</Typography>
                                                <FormControl>
                                                    <RadioGroup
                                                        row
                                                        value={studyingInSameSchool}
                                                        onChange={handleStudyingChange}
                                                    >
                                                        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                                        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                        {studyingInSameSchool === "yes" &&
                                            children.map((child, index) => (
                                                <Box key={child.id} sx={{ my: 1.8, p: 1, borderRadius: "10px", position: "relative", width: "100%" }}>
                                                    <Box px={1} sx={{ width: "100%" }}>
                                                        <Grid container sx={{ backgroundColor: "#8600BB1A" }}>
                                                            <Grid size={10} >
                                                                <Box sx={{ backgroundColor: "#8600BB", width: "150px", textAlign: "center", borderRadius: "0px 50px 50px 0px", py: 0.5 }}>
                                                                    <Typography sx={{ fontSize: "14px", color: "#fff", py: 0.3 }}>Child {index + 1}</Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid size={2} sx={{ display: "flex", justifyContent: "end", px: 1, alignItems: "center" }}>
                                                                {children.length < 5 && (
                                                                    (<IconButton sx={{ width: "25px", height: "25px" }} onClick={addChildren} >
                                                                        <AddIcon style={{ fontSize: "20px", color: "#8600BB" }} />
                                                                    </IconButton>)
                                                                )}
                                                                {index > 0 && (
                                                                    <IconButton sx={{ width: "25px", height: "25px" }} onClick={() => removeChildren(child.id)} >
                                                                        <RemoveIcon style={{ fontSize: "20px", color: "#8600BB" }} />
                                                                    </IconButton>
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                    <Grid container pt={1.5} spacing={3}>

                                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                                            <Typography sx={{ fontSize: "12px" }} component="span">Roll Number<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                                            <Autocomplete
                                                                disablePortal
                                                                options={studentsList}
                                                                getOptionLabel={(option) =>
                                                                    typeof option === "string" ? option : option.rollNumber || ""
                                                                }
                                                                value={studentsList.find((s) => s.rollNumber === child.rollNumber) || null}
                                                                onChange={(event, newValue) => {
                                                                    if (newValue) {
                                                                        updateChildField(child.id, "rollNumber", newValue.rollNumber);
                                                                        updateChildField(child.id, "childrenName", newValue.name || "");
                                                                    } else {
                                                                        updateChildField(child.id, "rollNumber", "");
                                                                        updateChildField(child.id, "childrenName", "");
                                                                    }
                                                                }}
                                                                isOptionEqualToValue={(option, value) => option.rollNumber === value.rollNumber}
                                                                sx={{ width: "100%", mt: 0.5 }}
                                                                renderOption={(props, option) => (
                                                                    <li {...props} key={option.rollNumber}>
                                                                        {option.rollNumber} — {option.name}
                                                                    </li>
                                                                )}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        size="small"
                                                                        sx={{
                                                                            "& .MuiInputBase-root": {
                                                                                height: 41,
                                                                                fontSize: 14,
                                                                            },
                                                                        }}
                                                                    />
                                                                )}
                                                            />

                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                                            <Typography sx={{ fontSize: "12px" }} component="span">Child Name<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                                            <TextField
                                                                id="outlined-size-small"
                                                                size="small"
                                                                value={child.childrenName}
                                                                disabled
                                                                sx={{ mt: 0.5 }}
                                                            />

                                                        </Grid>

                                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                                            <Box sx={{ width: "100%" }}>
                                                                <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Student Type<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                                                <Autocomplete
                                                                    disablePortal
                                                                    options={[
                                                                        "Old",
                                                                        "New",
                                                                    ]}
                                                                    value={child.studentType}
                                                                    onChange={(event, newValue) => updateChildField(child.id, "studentType", newValue)}
                                                                    sx={{ width: "100%", mt: 0.5 }}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            size="small"
                                                                            sx={{
                                                                                "& .MuiInputBase-root": {
                                                                                    height: 41,
                                                                                    fontSize: 14,
                                                                                },
                                                                            }}
                                                                        />
                                                                    )}
                                                                />

                                                            </Box>
                                                        </Grid>
                                                        {children.length !== 1 &&
                                                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                                                <Box sx={{ width: "100%" }}>
                                                                    <Typography sx={{ fontSize: "12px", color: "#000" }} component="span">Siblings&Twins<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography>
                                                                    <Autocomplete
                                                                        disablePortal
                                                                        options={[
                                                                            "Siblings",
                                                                            "Twins",
                                                                        ]}
                                                                        value={child.siblingsTwins}
                                                                        onChange={(event, newValue) => updateChildField(child.id, "siblingsTwins", newValue)}
                                                                        sx={{ width: "100%", mt: 0.5 }}
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                {...params}
                                                                                size="small"
                                                                                sx={{
                                                                                    "& .MuiInputBase-root": {
                                                                                        height: 41,
                                                                                        fontSize: 14,
                                                                                    },
                                                                                }}
                                                                            />
                                                                        )}
                                                                    />

                                                                </Box>
                                                            </Grid>
                                                        }

                                                    </Grid>
                                                </Box>
                                            ))}

                                    </Grid>
                                    <Box sx={{ position: "absolute", bottom: "10px", right: "10px", }}>
                                        {!isDisabledAcademic &&
                                            <>
                                                <Button onClick={handleStaffClear} sx={{ textTransform: "none", color: "#6B7280", py: 0.4, fontSize: "12.5px", fontWeight: 600, px: 2.2, mr: 1, borderRadius: "20px", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" } }}>
                                                    Clear
                                                </Button>
                                                <Button onClick={handleStaffSubmit} disableElevation variant="contained" sx={{ textTransform: "none", color: "#fff", py: 0.4, px: 3, fontSize: "12.5px", fontWeight: 700, borderRadius: "20px", backgroundColor: themeColor, boxShadow: `0 6px 14px ${themeColor}33`, "&:hover": { backgroundColor: themeColor, filter: "brightness(0.92)", boxShadow: `0 8px 18px ${themeColor}45` } }}>
                                                    Save
                                                </Button>
                                            </>
                                        }
                                        {isDisabledAcademic &&
                                            <Box sx={{ fontSize: "12.5px", color: "#2E7D32", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#E8F5E9", borderRadius: "20px", px: 1.6, py: 0.5 }}><CheckCircleIcon style={{ fontSize: "17px" }} /> Saved</Box>
                                        }
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Box>

                    </Box>
                </Box>
            </Box>
        </Box>
    );
}