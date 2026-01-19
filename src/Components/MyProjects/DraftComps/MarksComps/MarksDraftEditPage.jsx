import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar, TextareaAutosize } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { display, keyframes, useMediaQuery, useTheme } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SimpleBarChartPage from "../../Chart/SimpleBarChart";
import Loader from "../../Loader";
import axios from "axios";
import { DashboardTeachersAttendance, fetchAttendance, MarksStudentsFetch, postAttendance, postMarks, sectionsDropdown, updateAttendance } from "../../../Api/Api";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PrintIcon from '@mui/icons-material/Print';
import * as XLSX from 'xlsx';
import { Link } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../../../SnackBar";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";

export default function MarksDraftEditPage() {
    const today = dayjs().format("DD-MM-YYYY");
    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const theme = useTheme();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [examOptions, setExamsOptions] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [getData, setGetData] = useState([]);
    const [getDataStudents, setGetDataStudents] = useState([]);
    const [getDataSubjects, setGetDataSubjects] = useState([]);
    const [totalMarks, setTotalMarks] = useState("");
    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const exams = selectedGrade?.exams?.map((exam) => ({ examName: exam })) || [];
    const fileInputRef = useRef(null);
    const [selectedActions, setSelectedActions] = useState({});
    const [excelData, setExcelData] = useState([]);

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
            setExamsOptions(grades[0].exams || []);
            setSelectedExam(grades[0].exams?.[0] || null);
        }
    }, [grades]);

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const handleSubjectChange = (event, newValue) => {
        setSelectedSubject(newValue?.sectionName || null);
    };

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedSection(newValue.sections[0]);
            setExamsOptions(newValue.exams);
            setSelectedExam(newValue.exams[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
            setExamsOptions([]);
        }
    };

    const handleMarksChange = (rollNumber, subject, value) => {
        const numericValue = value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
        if (numericValue > 100) return;

        setMarks((prevMarks) => {
            const updatedMarks = { ...prevMarks };
            if (!updatedMarks[rollNumber]) {
                updatedMarks[rollNumber] = { subjects: {}, TotalMarks: 0, Percentage: 0, Status: "Pass" };
            }
            updatedMarks[rollNumber].subjects[subject] = Number(numericValue);

            const subjectMarks = Object.values(updatedMarks[rollNumber].subjects);
            const totalMarks = subjectMarks.reduce((sum, mark) => sum + mark, 0);
            const maxMarks = getDataSubjects.length * 100;
            const percentage = (totalMarks / maxMarks) * 100;

            updatedMarks[rollNumber].TotalMarks = totalMarks;
            updatedMarks[rollNumber].Percentage = percentage;

            const isPass = Object.values(updatedMarks[rollNumber].subjects).every((mark) => mark >= 35);
            updatedMarks[rollNumber].Status = isPass ? "Pass" : "Fail";

            return updatedMarks;
        });
    };

    const scrollContainerRef1 = useRef(null);
    const scrollContainerRef2 = useRef(null);

    const handleVerticalScroll = (e, container) => {
        const otherContainer = container === scrollContainerRef1 ? scrollContainerRef2 : scrollContainerRef1;
        if (otherContainer.current) {
            otherContainer.current.scrollTop = e.target.scrollTop;
        }
    };

    const handleAdd = (rollNumber) => {
        setOpenAlert(rollNumber);
    };

    const handleSaveComment = () => {
        setOpenAlert(false);
    };

    const calculateTotalMarks = () => {
        const subjectCount = getDataSubjects.length;
        const totalMarks = subjectCount * 100;
        return totalMarks;
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const isFormValid = () => {
        return getDataStudents.every((row) => {
            const studentMarks = marks[row.rollNumber];

            // Ensure TotalMarks is a string before calling trim()
            const totalMarks = String(studentMarks?.TotalMarks || '').trim();

            // Check if TotalMarks is filled
            if (totalMarks === '') {
                return false;
            }

            // Check if all subject marks are filled
            return Object.values(studentMarks?.subjects || {}).every((subjectMark) =>
                String(subjectMark || '').trim() !== ''
            );
        });
    };

    const handleImport = () => {
        fileInputRef.current.click();
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryData = event.target.result;
            const workbook = XLSX.read(binaryData, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

            const parsedMarks = {};
            sheetData.forEach((row) => {
                const rollNumber = row.RollNumber?.toString();
                if (!rollNumber) return;

                if (!parsedMarks[rollNumber]) {
                    parsedMarks[rollNumber] = { subjects: {}, TotalMarks: 0, Percentage: 0, Status: "Pass" };
                }

                getDataSubjects.forEach((subject) => {
                    if (row[subject] !== undefined) {
                        parsedMarks[rollNumber].subjects[subject] = Number(row[subject]) || 0;
                    }
                });

                const subjectMarks = Object.values(parsedMarks[rollNumber].subjects);
                const totalMarks = subjectMarks.reduce((sum, mark) => sum + mark, 0);
                const maxMarks = getDataSubjects.length * 100;
                const percentage = (totalMarks / maxMarks) * 100;
                const isPass = subjectMarks.every((mark) => mark >= 35);

                parsedMarks[rollNumber].TotalMarks = totalMarks;
                parsedMarks[rollNumber].Percentage = percentage;
                parsedMarks[rollNumber].Status = isPass ? "Pass" : "Fail";
            });

            setMarks(parsedMarks);
            console.log("Parsed Marks Data:", parsedMarks);
        };

        reader.readAsBinaryString(file);
    };

    const handleExportAllData = () => {
        const header = [
            'S.No',
            'Roll Number',
            'Student Name',
            'Class',
            'Section',
            'Total Marks',
            'Percentage',
            'Status',
            'Comments',
            ...getDataSubjects
        ];

        const data = getDataStudents.map((row, index) => {
            const studentMarks = marks[row.rollNumber] || {};
            return [
                index + 1,
                row.rollNumber,
                row.name,
                row.grade,
                row.section,
                studentMarks.TotalMarks || 0,
                studentMarks.Percentage ? `${Math.floor(studentMarks.Percentage)}%` : '0%',
                studentMarks.Status || 'Nill',
                comments[row.rollNumber] || "No comments",
                ...getDataSubjects.map((subject) => studentMarks.subjects?.[subject] || 0)
            ];
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student Data');

        XLSX.writeFile(wb, 'student_data.xlsx');
    };

    const handleExportSingleData = (studentData) => {
        const header = [
            'S.No',
            'Roll Number',
            'Student Name',
            'Class',
            'Section',
            'Total Marks',
            'Percentage',
            'Status',
            'Comments',
            ...getDataSubjects
        ];

        const studentMarks = marks[studentData.rollNumber] || {};

        const data = [
            [
                1,
                studentData.rollNumber,
                studentData.name,
                studentData.grade,
                studentData.section,
                studentMarks.TotalMarks || 0,
                studentMarks.Percentage ? `${Math.floor(studentMarks.Percentage)}%` : '0%',
                studentMarks.Status || 'Nill',
                comments[studentData.rollNumber] || "No comments",
                ...getDataSubjects.map((subject) => studentMarks.subjects?.[subject] || 0)
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student Data');

        XLSX.writeFile(wb, `${studentData.name}_data.xlsx`);
    };

    useEffect(() => {
        handleFetch();
    }, [selectedGradeId, selectedSection, selectedExam]);

    const handleFetch = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(MarksStudentsFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    GradeId: selectedGradeId || "131",
                    Section: selectedSection || "A1",
                },

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGetData(res.data)
            setGetDataStudents(res.data.students)
            setGetDataSubjects(res.data.subjects)
            console.log("Data fetched successfully:", res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMarks = async (status) => {
        setIsLoading(true);

        const all_marksRequest = getDataStudents.map((row) => {
            const studentMarks = marks[row.rollNumber] || {};

            return {
                examName: selectedExam,
                rollnumber: row.rollNumber,
                studentName: row.name,
                grade: row.grade,
                section: row.section,
                profile: row.profile || "",
                totalMarks: calculateTotalMarks(),
                marksScored: studentMarks.TotalMarks || 0,
                percentage: studentMarks.Percentage ? Math.floor(studentMarks.Percentage) : 0,
                remarks: studentMarks.Status || "Nill",
                teacherNotes: comments[row.rollNumber] || "",
                ...getDataSubjects.reduce((subjects, subject) => {
                    subjects[subject] = studentMarks.subjects?.[subject] || 0;
                    return subjects;
                }, {})
            };
        });

        const payload = {
            gradeId: selectedGradeId,
            status: status,
            all_marksRequest,
        };

        try {
            const res = await axios.post(
                postMarks,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Added Successfully");
        } catch (error) {
            console.error("Error saving:", error);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to add data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{
            backgroundColor: "#F6F6F8", height: {
                xs: "100%",
                lg: "91.5vh",
            }
        }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box p={3}>
                <Grid container >
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 3
                        }}>
                        <Box sx={{ display: "flex" }}>
                            <Link style={{ textDecoration: "none" }} to="/dashboardmenu/marks">
                                <IconButton sx={{ width: "27px", height: "27px", marginTop: '3px' }}>
                                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                </IconButton>
                            </Link>
                            <Typography sx={{ fontWeight: "600", ml: 1, marginTop: "3px", fontSize: "19px" }}>
                                Add Marks
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid
                        sx={{ mt: 0.5, pl: 3 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 4,
                            lg: 9
                        }}>
                        <Grid container spacing={2}>

                            <Grid
                                size={{
                                    lg: 3
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={grades}
                                    getOptionLabel={(option) => option.sign}
                                    value={grades.find((item) => item.id === selectedGradeId) || null}
                                    onChange={(event, newValue) => {
                                        handleGradeChange(newValue);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">
                                            {option.sign}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            placeholder="Select Class"
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid
                                size={{
                                    lg: 3
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={sections}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        sections.find((option) => option.sectionName === selectedSection) ||
                                        null
                                    }
                                    onChange={handleSectionChange}
                                    isOptionEqualToValue={(option, value) =>
                                        option.sectionName === value.sectionName
                                    }
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">
                                            {option.sectionName}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            placeholder="Select Section"
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid
                                size={{
                                    lg: 3
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={exams.length > 0
                                        ? exams.map((exam) => ({ sectionName: exam.examName }))
                                        : []}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        selectedExam
                                            ? { sectionName: selectedExam }
                                            : null
                                    }
                                    onChange={(event, value) => handleSubjectChange(value ? value.sectionName : null)}
                                    isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">
                                            {option.sectionName}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                            placeholder="Select Exam"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3
                                }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleExportAllData}
                                    sx={{
                                        borderColor: "#A9A9A9",
                                        backgroundColor: "#fff",
                                        py: 0.3,
                                        width: "100%",
                                        color: "#000",
                                        textTransform: "none",
                                        mb: 1
                                    }}>
                                    <ExitToAppIcon sx={{ fontSize: "20px" }} />
                                    &nbsp;Export
                                </Button>
                            </Grid>
                            {/* <Grid item lg={3}>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: "#A9A9A9",
                                        backgroundColor: "#000",
                                        py: 0.3,
                                        width: "100%",
                                        color: "#fff",
                                        textTransform: "none",
                                        border: "none",
                                        mb: 1
                                    }}
                                    onClick={handleImport}
                                >
                                    <BackupOutlinedIcon sx={{ fontSize: "20px" }} />
                                    &nbsp;Import
                                </Button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </Grid> */}
                        </Grid>
                    </Grid>
                </Grid>

                {/* <Box hidden={value !== 0}> */}
                <Box sx={{ marginTop: "-10px" }}>
                    <Box sx={{ display: "flex" }}>
                        <Grid container sx={{ justifyContent: "space-between" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 3
                                }}>
                                <Box sx={{ display: "flex", border: "1px solid #E8DDEA", mt: 2.8, width: "100%", }}>
                                    <Typography sx={{ fontSize: "12px", color: "#fff", backgroundColor: "#307EB9", padding: "0px 5px 0px 5px", borderRadius: "4px 0px 0px 0px", fontWeight: "600", }}>
                                        {getData.gradeSection}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "#000", px: 1, }}>
                                        Class Teacher - {getData.classTeacher || "Not Assigned"}
                                    </Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    </Box>

                    <Grid container>
                        <Grid size={12}>
                            <TableContainer
                                ref={scrollContainerRef1}
                                sx={{
                                    border: "1px solid #E8DDEA",
                                    maxWidth: "100%",
                                    maxHeight: "72vh",
                                    overflowY: "auto",
                                    overflowX: "auto",
                                    width: "100%",
                                }}
                                onScroll={(e) => handleVerticalScroll(e, scrollContainerRef1)}
                            >
                                <Table sx={{ tableLayout: "fixed" }} stickyHeader={!isMobile} aria-label="attendance and marks table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    // position: "sticky",
                                                    // top: 0,
                                                    // left: 0,
                                                    position: {
                                                        xs: "static",
                                                        sm: "sticky",
                                                    },
                                                    top: {
                                                        xs: "auto",
                                                        sm: 0,
                                                    },
                                                    left: {
                                                        xs: "auto",
                                                        sm: 0,
                                                    },
                                                    zIndex: 3,
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#fff7f7",
                                                    whiteSpace: "nowrap",
                                                    width: "50px",
                                                }}
                                            >
                                                S.No
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    // position: "sticky",
                                                    // top: 0,
                                                    // left: 50,
                                                    position: {
                                                        xs: "static",
                                                        sm: "sticky",
                                                    },
                                                    top: {
                                                        xs: "auto",
                                                        sm: 0,
                                                    },
                                                    left: {
                                                        xs: "auto",
                                                        sm: 50,
                                                    },
                                                    zIndex: 3,
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#fff7f7",
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Roll Number
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    position: {
                                                        xs: "static",
                                                        sm: "sticky",
                                                        lg: "sticky",
                                                    },
                                                    top: {
                                                        xs: "auto",
                                                        sm: 0,
                                                    },
                                                    left: {
                                                        xs: "auto",
                                                        sm: 150,
                                                    },
                                                    zIndex: 3,
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#fff7f7",
                                                    whiteSpace: "nowrap",
                                                    width: "120px",
                                                }}
                                            >
                                                Student Name
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Class
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Section
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Student Picture
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Total Marks
                                            </TableCell>
                                            {getDataSubjects.map((subject) => (
                                                <TableCell
                                                    key={subject}
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#F8F3FE",
                                                        whiteSpace: "nowrap",
                                                        width: "100px",
                                                    }}
                                                >
                                                    {subject}
                                                </TableCell>
                                            ))}

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Marks Scored
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    width: "100px",
                                                }}
                                            >
                                                Percentage
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    width: "100px",
                                                }}
                                            >
                                                Remarks
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    width: "100px",
                                                }}
                                            >
                                                Notes
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    width: "100px",
                                                }}
                                            >
                                                Export
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getDataStudents.map((row, index) => (
                                            <TableRow key={row.rollNumber}>
                                                <TableCell
                                                    sx={{
                                                        position: {
                                                            xs: "static",
                                                            sm: "sticky",
                                                        },
                                                        left: 0,
                                                        zIndex: 2,
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        position: {
                                                            xs: "static",
                                                            sm: "sticky",
                                                        },
                                                        left: 50,
                                                        zIndex: 2,
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                    }}
                                                >
                                                    {row.rollNumber}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        position: {
                                                            xs: "static",
                                                            sm: "sticky",
                                                        },
                                                        left: 150,
                                                        zIndex: 2,
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                    }}
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff", }}>
                                                    {row.grade}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff", }}>
                                                    {row.section}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff", }}>
                                                    <Button
                                                        sx={{ color: "#000", textTransform: "none" }}
                                                        onClick={() => handleViewClick(row.profile)}
                                                    >
                                                        <ImageIcon sx={{ color: "#000", marginRight: 1 }} />
                                                        View
                                                    </Button>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                        color: "#E60154"
                                                    }}
                                                >
                                                    {calculateTotalMarks(row.rollNumber)}
                                                </TableCell>
                                                {getDataSubjects.map((subject) => (
                                                    <TableCell
                                                        key={subject}
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                            padding: "0px",
                                                            minWidth: "90px",
                                                            backgroundColor: "#fff",
                                                        }}
                                                    >
                                                        <TextField
                                                            size="small"
                                                            variant="standard"
                                                            value={marks[row.rollNumber]?.subjects?.[subject] || ""}
                                                            onChange={(e) => handleMarksChange(row.rollNumber, subject, e.target.value)}
                                                            InputProps={{
                                                                disableUnderline: true,
                                                            }}
                                                            sx={{
                                                                "& .MuiInputBase-input": {
                                                                    textAlign: "center",
                                                                },
                                                                "& .MuiInputBase-root": {
                                                                    border: "none",
                                                                },
                                                            }}
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                        color:
                                                            marks[row.rollNumber]?.Status === undefined || marks[row.rollNumber]?.Status === "Nill"
                                                                ? "black"
                                                                : marks[row.rollNumber]?.Status === "Fail"
                                                                    ? "red"
                                                                    : "green",
                                                    }}
                                                >
                                                    {marks[row.rollNumber]?.TotalMarks || 0}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                    }}
                                                >
                                                    {marks[row.rollNumber]?.Percentage ? `${Math.floor(marks[row.rollNumber].Percentage)}%` : "0%"}

                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                        color:
                                                            marks[row.rollNumber]?.Status === undefined || marks[row.rollNumber]?.Status === "Nill"
                                                                ? "black"
                                                                : marks[row.rollNumber]?.Status === "Fail"
                                                                    ? "red"
                                                                    : "green",
                                                    }}
                                                >
                                                    {marks[row.rollNumber]?.Status || "Nill"}
                                                </TableCell>

                                                <TableCell
                                                    sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}
                                                >
                                                    <Button
                                                        onClick={() => handleAdd(row.rollNumber)}
                                                        sx={{ py: 0.1, textTransform: "none", borderRadius: "30px" }}
                                                    >
                                                        {comments[row.rollNumber] ? "View" : "Add"}
                                                    </Button>

                                                    <Dialog
                                                        open={openAlert === row.rollNumber}
                                                        onClose={() => setOpenAlert(null)}
                                                        maxWidth="sm"
                                                        fullWidth
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                minHeight: '200px',
                                                                padding: 2,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: '#fff',
                                                                    pr: 3,
                                                                    width: '100%',
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: "14px",
                                                                        fontWeight: 'bold',
                                                                        marginBottom: 1,
                                                                        pb: 1,
                                                                        borderBottom: "1px solid #AFAFAF",
                                                                    }}
                                                                >
                                                                    Add Comment
                                                                </Typography>
                                                                <TextareaAutosize
                                                                    minRows={6}
                                                                    placeholder="Write your comment here..."
                                                                    value={comments[row.rollNumber] || ""}
                                                                    onChange={(e) =>
                                                                        setComments((prev) => ({
                                                                            ...prev,
                                                                            [row.rollNumber]: e.target.value,
                                                                        }))
                                                                    }
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '12px',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #ccc',
                                                                        fontSize: '14px',
                                                                        marginBottom: '20px',
                                                                        resize: 'none',
                                                                        border: "none",
                                                                        outline: 'none',
                                                                    }}
                                                                />
                                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                    <Button
                                                                        onClick={() => handleSaveComment()}
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            backgroundColor: websiteSettings.mainColor,
                                                                            color: websiteSettings.textColor,
                                                                            borderRadius: '30px',
                                                                            fontSize: '16px',
                                                                            padding: '0px 35px',
                                                                            '&:hover': {
                                                                                backgroundColor: websiteSettings.mainColor || '#0056b3',
                                                                            },
                                                                        }}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Dialog>
                                                </TableCell>

                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}>
                                                    <IconButton onClick={() => handleExportSingleData(row)}>
                                                        <PrintIcon style={{ color: "#000" }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, position: "relative", bottom: "-10px" }}>
                        <Button
                            variant="outlined"
                            onClick={() => handleSaveMarks('draft')}
                            sx={{
                                backgroundColor: '#fff',
                                textTransform: 'none',
                                color: '#000',
                                fontWeight: '600',
                                borderRadius: '50px',
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderColor: "black",
                                px: 3,
                                boxShadow: "none",
                            }}
                        >
                            Save as Draft
                        </Button>

                        <Button
                            onClick={() => handleSaveMarks('post')}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                backgroundColor: websiteSettings.mainColor,
                                color: websiteSettings.textColor,
                                fontWeight: '600',
                                borderRadius: '50px',
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                px: 3,
                                boxShadow: "none",
                            }}
                            disabled={!isFormValid()}
                        >
                            Publish
                        </Button>
                    </Box>

                </Box>


                <Dialog
                    open={openImage}
                    onClose={handleImageClose}
                    sx={{
                        '& .MuiPaper-root': {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            borderRadius: 0,
                            padding: 0,
                            overflow: 'visible',
                        },
                    }}
                    BackdropProps={{
                        style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    }}
                >
                    <img
                        src={imageUrl}
                        alt="Popup"
                        style={{
                            maxWidth: '300px',
                            maxHeight: '80vh',
                        }}
                    />
                    <DialogActions sx={{ padding: 0 }}>
                        <IconButton onClick={handleImageClose} sx={{ position: 'absolute', top: -10, right: -40 }}>
                            <CloseIcon style={{ color: "#fff" }} />
                        </IconButton>
                    </DialogActions>
                </Dialog>


            </Box>
        </Box>
    );
}
