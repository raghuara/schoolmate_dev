import React, { useEffect, useRef, useState } from "react";
import { Box, Stepper, Step, StepLabel, Typography, IconButton, useMediaQuery, Grid, Button, FormLabel, RadioGroup, FormControlLabel, Radio, FormControl, Accordion, AccordionSummary, AccordionDetails, TextField, FormGroup, Checkbox, Autocomplete, Paper, Popper, InputAdornment, Dialog, TextareaAutosize, DialogContent, DialogActions, FormHelperText, Popover } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDropzone } from "react-dropzone";
import { Textarea } from "@mui/joy";
import { postStaffInformation, postStaffStudentInformation, postStudentAcademicInformation, postStudentDocumentInformation, postStudentFamilyInformation, postStudentgeneralhealthInformation, postStudentGuardianInformation, postStudentInformation, postStudentSiblingInformation } from "../../../Api/Api";
import axios from "axios";
import DropDownList from "../../DropdownList";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import TamilKeyboard from "../../Tools/TamilKeyBoardLayout";

const steps = [
    "Student Academic Info",
    "Student Info",
    "Family Info",
    "Guardian Info",
    "Sibling Info",
    "Upload Documents",
    "Medical Info"
];

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
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeStep, setActiveStep] = useState(0);
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
    const [staffDesignation, setStaffDesignation] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [profileImageError, setProfileImageError] = useState("");

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

    const handleAcademicSubmit = async (status) => {
        if (!staffNameEnglish.trim()) {
            setMessage("Student name in english is required");
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
            setMessage("Roll no is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }


        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("StaffRollNumber", staffRollNumber);
            formData.append("StaffNameInEnglish", staffNameEnglish);
            formData.append("StaffNameInTamil", staffNameTamil);
            formData.append("DateOfBirth", dateOfBirth);
            formData.append("Gender", gender);
            formData.append("AdmissionClass", selectedGradeId);
            formData.append("Section", selectedSection);
            formData.append("StaffCategory", staffCategory);
            formData.append("StaffDesignation", staffDesignation);
            formData.append("StaffPassportSizePhotofiletype", "image");
            if (profileImage) {
                formData.append("PassportSizePhotofile", profileImage);
            }


            const res = await axios.post(postStaffInformation, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("User created successfully.");
            setFetchRollNumber(staffRollNumber)
            setIsDisabledStaffInfo(true)
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Error while inserting data");
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
        setProfileImage(null);
        setProfileImagePreview("");
        setProfileImageError("");
    }


    const handleStaffSubmit = async (status) => {

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
                staffRollNumber: staffRollNumber,
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

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully.");
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Error while inserting data");
            setFetchRollNumber("")
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
            <Box sx={{ backgroundColor: "#f2f2f2", borderRadius: "10px 10px 10px 0px", px: 2 }}>
                <Grid container sx={{ py: 1.5 }}>
                    <Grid size={{ xs: 12, md: 6, lg: 9 }} sx={{ display: "flex", alignItems: "center" }}>

                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: "3px", mr: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: "20px" }}>Create Staff Details</Typography>
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
                    <Box pt={1}>
                        <Accordion sx={{ boxShadow: "none" }} defaultExpanded>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                sx={{ backgroundColor: "#fff7f7", py: 0.5, position: "relative", }}
                            >
                                <Typography sx={{ fontWeight: "600" }} component="span">Staff Info</Typography>
                            </AccordionSummary>
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
                                            <Typography sx={{ fontSize: "12px" }} component="span">Student Name In Tamil</Typography><br />
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
                                                <Button onClick={handleAcademicClear} sx={{ textTransform: "none", color: "#000", py: 0.2, fontSize: "12px", px: 2.5, borderRadius: "20px" }}>
                                                    Clear
                                                </Button>
                                                <Button onClick={handleAcademicSubmit} sx={{ textTransform: "none", color: "#000", py: 0.2, px: 2.5, fontSize: "12px", borderRadius: "20px", backgroundColor: websiteSettings.mainColor }}>
                                                    Save
                                                </Button>
                                            </>
                                        }
                                        {isDisabledStaffInfo &&
                                            <Box sx={{ fontSize: "13px", color: "green", fontWeight: "600", display: "flex", justifyContent: "center", alignItems: "center" }}><CheckCircleIcon style={{ fontSize: "20px" }} />&nbsp; Saved</Box>
                                        }
                                    </Box>

                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Box sx={{ mt: 2 }}>
                            <Accordion sx={{ boxShadow: "none" }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel2-header"
                                    sx={{ backgroundColor: "#fff7f7", py: 0.5, position: "relative" }}
                                >
                                    <Typography sx={{ fontWeight: "600" }} component="span">Student Info</Typography>
                                </AccordionSummary>
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
                                                <Typography sx={{ fontSize: "12px" }}>Studying in Same School</Typography>
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
                                                            <TextField
                                                                id="outlined-size-small"
                                                                size="small"
                                                                value={child.rollNumber}
                                                                onChange={(e) => updateChildField(child.id, "rollNumber", e.target.value)}
                                                                inputProps={{
                                                                    maxLength: 25,
                                                                    pattern: "[A-Za-z ]*"
                                                                }}
                                                                sx={{ mt: 0.5 }}
                                                            />

                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ pt: 1 }} >
                                                            <Typography sx={{ fontSize: "12px" }} component="span">Child Name<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></Typography><br />
                                                            <TextField
                                                                id="outlined-size-small"
                                                                size="small"
                                                                value={child.childrenName}
                                                                onChange={(e) => updateChildField(child.id, "childrenName", e.target.value)}
                                                                inputProps={{
                                                                    maxLength: 25,
                                                                    pattern: "[A-Za-z ]*"
                                                                }}
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
                                                <Button onClick={handleStaffClear} sx={{ textTransform: "none", color: "#000", py: 0.2, fontSize: "12px", px: 2.5, borderRadius: "20px" }}>
                                                    Clear
                                                </Button>
                                                <Button onClick={handleStaffSubmit} sx={{ textTransform: "none", color: "#000", py: 0.2, px: 2.5, fontSize: "12px", borderRadius: "20px", backgroundColor: websiteSettings.mainColor }}>
                                                    Save
                                                </Button>
                                            </>
                                        }
                                        {isDisabledAcademic &&
                                            <Box sx={{ fontSize: "13px", color: "green", fontWeight: "600", display: "flex", justifyContent: "center", alignItems: "center" }}><CheckCircleIcon style={{ fontSize: "20px" }} />&nbsp; Saved</Box>
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