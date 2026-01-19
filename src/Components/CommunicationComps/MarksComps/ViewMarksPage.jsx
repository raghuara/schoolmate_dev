import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { fetchAllMarksStudents, fetchAllMarksStudents02, MarksStudentsFetch } from "../../../Api/Api";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PrintIcon from '@mui/icons-material/Print';
import * as XLSX from 'xlsx';
import { Link, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../../SnackBar";
import { selectGrades } from "../../../Redux/Slices/DropdownController";

const percentageRanges = [
    { label: "91% to 100%", min: 91, max: 100 },
    { label: "81% to 90%", min: 81, max: 90 },
    { label: "71% to 80%", min: 71, max: 80 },
    { label: "61% to 70%", min: 61, max: 70 },
    { label: "51% to 60%", min: 51, max: 60 },
    { label: "41% to 50%", min: 41, max: 50 },
    { label: "31% to 40%", min: 31, max: 40 },
    { label: "21% to 30%", min: 21, max: 30 },
    { label: "11% to 20%", min: 11, max: 20 },
    { label: "0% to 10%", min: 0, max: 10 },
];

export default function ViewMarksPage() {
    const today = dayjs().format("DD-MM-YYYY");
    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const { gradeId: passedGradeId } = location.state || {};
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const theme = useTheme();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [selectedClassSection, setSelectedClassSection] = useState("A1");
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceTableData, setAttendanceTableData] = useState([]);
    const [selectedActions, setSelectedActions] = useState({});
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [maxMarks, setMaxMarks] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [examOptions, setExamsOptions] = useState([]);
    const [openAlert, setOpenAlert] = useState(false);
    const [getData, setGetData] = useState([]);
    const [getDataStudents, setGetDataStudents] = useState([]);
    const [getDataSubjects, setGetDataSubjects] = useState([]);
    const [totalMarks, setTotalMarks] = useState("");
    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const { grade, gradeId } = location.state || {};
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [subjects, setSubjects] = useState([]);
    const [selectedRange, setSelectedRange] = useState(null);
    const [secondarySubjects, setSecondarySubjects] = useState([]);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const exams = selectedGrade?.exams?.map((exam) => ({ examName: exam })) || [];
    const groupOptions =
        selectedGrade?.sectionGroups?.find(sec => sec.section === selectedSection)?.groups || [];

    const toKey = (subject) => subject.replace(/\s+/g, "");

    useEffect(() => {
        if (grades && grades.length > 0) {
            const selectedGrade = grades.find(g => g.id === passedGradeId) || grades[0];

            const firstSection = selectedGrade.sections?.[0] || "";
            const firstExamObj = selectedGrade.exams?.[0] || null;

            setSelectedGradeId(selectedGrade.id);
            setSelectedSection(firstSection);
            if (firstExamObj) {
                setSelectedExam(firstExamObj.exam);
                setExamsOptions(selectedGrade.exams.map(e => e.exam));
            } else {
                setSelectedExam("");
                setExamsOptions([]);
            }
        }
    }, [grades, passedGradeId]);


    useEffect(() => {
        if (!selectedGrade?.subjects && selectedGrade?.sectionGroups && selectedSection) {
            const matchedSection = selectedGrade.sectionGroups.find(
                sec => sec.section === selectedSection
            );
            if (matchedSection?.groups?.length > 0) {
                setSelectedGroup(matchedSection.groups[0]);
            } else {
                setSelectedGroup(null);
            }
        }
    }, [selectedGrade, selectedSection]);

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedSection(newValue.sections[0]);
            const exams = Array.isArray(newValue.exams)
                ? newValue.exams.map(e => e.exam)
                : [];

            setExamsOptions(exams);
            setSelectedExam(exams.length > 0 ? exams[0] : "");
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
            setExamsOptions([]);
        }
    };

    const handleSectionChange = (event, value) => {
        setSelectedSection(value ? value.sectionName : null);
    };

    const handleExamChange = (event, newValue) => {
        setSelectedExam(newValue);
        console.log("Selected Exam:", newValue);
    };

    const formatSubjectName = (name) => {
        return name
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b\w/g, (char) => char.toUpperCase());
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

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };


    const handleExportAllData = () => {

        const header = [
            'S.No',
            'Roll Number',
            'Student Name',
            'Class',
            'Section',
            'Maximum Marks',
            ...subjects,
            ...secondarySubjects,
            'Scored Marks',
            'Percentage',
            'Grade',
            'Notes',
        ];

        const data = filteredData.map((row, index) => [
            index + 1,
            row.rollnumber,
            row.studentName,
            row.grade,
            row.section,
            row.totalMarks ?? 0,

            ...subjects.map((subject) => {
                const key = toKey(subject);
                return row.subjects?.[key] ?? "-";
            }),

            ...secondarySubjects.map((subject) => {
                const key = toKey(subject);
                return row.subjects?.[key] ?? "-";
            }),
            row.marksScored ?? 0,
            row.percentage ? `${Math.floor(row.percentage)}%` : '0%',
            row.rank || "-",
            row.teacherNotes || "No comments",
        ]);

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
            ...subjects,
            ...secondarySubjects,
            'Marks Scored',
            'Percentage',
            'Grade',
            'Teacher Notes'
        ];

        const data = [
            [
                1,
                studentData.rollnumber,
                studentData.studentName,
                studentData.grade,
                studentData.section,
                studentData.totalMarks ?? 0,
                ...subjects.map((subject) => {
                    const key = toKey(subject);
                    return studentData.subjects?.[key] ?? "-";
                }),
                ...secondarySubjects.map((subject) => {
                    const key = toKey(subject);
                    return studentData.subjects?.[key] ?? "-";
                }),
                studentData.marksScored ?? 0,
                studentData.percentage ? `${Math.floor(studentData.percentage)}%` : '0%',
                studentData.rank || "-",
                studentData.teacherNotes || "No comments"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student Data');

        XLSX.writeFile(wb, `${studentData.studentName}_data.xlsx`);
    };

    useEffect(() => {
        handleFetchStudent();
    }, [selectedGradeId, selectedSection, selectedGroup, selectedExam]);

    const handleFetchStudent = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(MarksStudentsFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    GradeId: selectedGradeId || passedGradeId || grades?.[0]?.id,
                    Section: selectedSection || grades?.[0]?.sections[0],
                    Exam: selectedExam || grades?.[0]?.exams[0],
                    Group: selectedGroup,
                },

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSubjects(res.data.subjects || []);
            setSecondarySubjects(res.data.secondarySubjects || [])
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetch();
    }, [selectedGradeId, selectedSection, selectedExam, selectedGroup, getDataSubjects]);

    const handleFetch = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchAllMarksStudents02, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    GradeId: selectedGradeId || passedGradeId || grades?.[0]?.id,
                    Section: selectedSection || grades?.[0]?.sections?.[0],
                    Exam: selectedExam || grades?.[0]?.exams?.[0]?.exam,
                    Group: selectedGroup || "",
                    Status: "post"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setGetData(res.data);

            const studentsData = res.data?.students || [];

            if (studentsData.length > 0 && studentsData[0].maxMark) {
                setMaxMarks(studentsData[0].maxMark);
            } else {
                setMaxMarks(100);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setMaxMarks(100);
        } finally {
            setIsLoading(false);
        }
    };

    const viewData = getData?.students || [];

    const filteredData = useMemo(() => {
        if (!selectedRange) return viewData;
        return viewData.filter(
            (row) =>
                row.percentage >= selectedRange.min &&
                row.percentage <= selectedRange.max
        );
    }, [viewData, selectedRange]);

    return (
        <Box sx={{
            backgroundColor: "#F6F6F8", height: {
                xs: "100%",
            }
        }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box>
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: "#f2f2f2",
                        pb: 1,
                        pt: 1,
                        px: 2,
                        borderBottom: "1px solid #ddd",
                    }}
                >
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
                                    View Marks
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid
                            sx={{ mt: 0.5, pl: 3 }}
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 9,
                                lg: 9
                            }}>
                            <Grid container spacing={2} sx={{ display: "flex", justifyContent: "end" }}>
                                <Grid
                                    size={{
                                        lg: 2.4
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
                                        lg: 2.4
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
                                {/* {!selectedGrade?.subjects && selectedSection && (
                                    <Grid
                                        size={{
                                            lg: 2.4
                                        }}>
                                        <Autocomplete
                                            disablePortal
                                            options={groupOptions}
                                            getOptionLabel={(option) => option}
                                            onChange={(event, newValue) => setSelectedGroup(newValue || "")}
                                            value={selectedGroup || null}
                                            sx={{ width: "100%" }}
                                            PaperComponent={(props) => (
                                                <Paper
                                                    {...props}
                                                    style={{
                                                        ...props.style,
                                                        maxHeight: "150px",
                                                        backgroundColor: "#000",
                                                        color: "#fff",
                                                        fontSize: "14px"
                                                    }}
                                                />
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select Group"
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
                                )} */}

                                <Grid
                                    size={{
                                        lg: 2.4,
                                        md: 6,
                                        sm: 12
                                    }}>
                                    <Autocomplete
                                        disablePortal
                                        options={examOptions}
                                        getOptionLabel={(option) => option}
                                        onChange={handleExamChange}
                                        value={selectedExam}
                                        sx={{ width: "100%" }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    maxHeight: "150px",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
                                                    fontSize: "14px"
                                                }}
                                            />
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Exam"
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
                                        lg: 2.4
                                    }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleExportAllData}
                                        sx={{
                                            borderColor: "#A9A9A9",
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

                            </Grid>

                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ px: 2, pb: 2 }}>

                    <Grid container spacing={1} sx={{ justifyContent: "end", mt: 0.5 }}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 5,
                                lg: 2
                            }}>

                            <Autocomplete
                                disablePortal
                                options={percentageRanges}
                                getOptionLabel={(option) => option.label}
                                value={selectedRange}
                                onChange={(event, newValue) => setSelectedRange(newValue)}
                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                sx={{ width: "100%", }}
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
                                        {option.label}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Filter by Percentage"
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
                                xs: 12,
                                sm: 12,
                                lg: 2
                            }}>
                            <TextField
                                size="small"
                                placeholder="Max Mark"
                                value={maxMarks || 100}
                                disabled
                                inputProps={{
                                    min: 1,
                                    max: 100,
                                    inputMode: "numeric",
                                }}
                                sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {
                                        height: "33px",
                                    },
                                    "& .MuiInputBase-input": {
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        padding: "0 8px",
                                        textAlign: "center",
                                    },
                                }}
                            />

                        </Grid>
                    </Grid>
                    <Box sx={{ display: "flex" }}>
                        <Grid container sx={{ justifyContent: "space-between" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 3
                                }}>
                                <Box sx={{ display: "flex", marginTop: "-15px", width: "200px", }}>
                                    <Typography sx={{ fontSize: "12px", color: "#fff", backgroundColor: "#307EB9", padding: "0px 5px 0px 5px", borderRadius: "4px 0px 0px 0px", fontWeight: "600", }}>
                                        {getData.gradeSection}
                                    </Typography>
                                    {/* <Typography sx={{ fontSize: "12px", color: "#000", px: 1, }}>
                                        Class Teacher - {getData.classTeacher || "Not Assigned"}
                                    </Typography> */}
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
                                    maxHeight: "76vh",
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
                                                Maximum Marks
                                            </TableCell>
                                            {subjects.map((subject) => (
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

                                            {secondarySubjects.map((subject) => (
                                                <TableCell
                                                    key={subject}
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#F8F3FE",
                                                        whiteSpace: "nowrap",
                                                        width: "120px",
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {formatSubjectName(subject)}
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
                                                Scored Marks
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
                                                Grade
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
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={subjects.length + 10}
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "600",
                                                        color: "#999",
                                                        height: "100px"
                                                    }}
                                                >
                                                    No data available
                                                </TableCell>
                                            </TableRow>
                                        ) : (

                                            filteredData.map((row, index) => {
                                                console.log("Rendering row with rollnumber:", row.rollnumber);
                                                return (
                                                    <TableRow key={row.rollnumber}>
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
                                                            {row.rollnumber}
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
                                                            {row.studentName}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}>
                                                            {row.grade}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}>
                                                            {row.section}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}>
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
                                                                fontWeight: "600",
                                                                color: "#37474F",
                                                            }}
                                                        >
                                                            {row.totalMarks}
                                                        </TableCell>

                                                        {subjects.map((subject) => {
                                                            const key = subject.replace(/\s+/g, "");
                                                            const value = row.subjects?.[key] ?? "-";

                                                            return (
                                                                <TableCell
                                                                    key={`${row.rollnumber}-${subject}`}
                                                                    sx={{
                                                                        borderRight: 1,
                                                                        borderColor: "#E8DDEA",
                                                                        textAlign: "center",
                                                                        padding: "0px",
                                                                        minWidth: "90px",
                                                                        backgroundColor: "#fff",
                                                                        color: value === "AB" ? "red" : "#424242",
                                                                    }}
                                                                >
                                                                    {value}
                                                                </TableCell>
                                                            );
                                                        })}

                                                        {secondarySubjects.map((subject) => {
                                                            const key = subject.replace(/\s+/g, "");
                                                            const value = row.subjects?.[key] ?? "-";

                                                            return (
                                                                <TableCell
                                                                    key={`${row.rollnumber}-${subject}`}
                                                                    sx={{
                                                                        borderRight: 1,
                                                                        borderColor: "#E8DDEA",
                                                                        textAlign: "center",
                                                                        padding: "0px",
                                                                        minWidth: "90px",
                                                                        backgroundColor: "#fff",
                                                                        color: value === "AB" ? "red" : "#424242",
                                                                    }}
                                                                >
                                                                    {value}
                                                                </TableCell>
                                                            );
                                                        })}

                                                        <TableCell
                                                            sx={{
                                                                borderRight: 1,
                                                                borderColor: "#E8DDEA",
                                                                textAlign: "center",
                                                                backgroundColor: "#fff",
                                                                color: "black",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            {row.marksScored}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                borderRight: 1,
                                                                borderColor: "#E8DDEA",
                                                                textAlign: "center",
                                                                backgroundColor: "#fff",
                                                                fontWeight: "600",
                                                                color:
                                                                    row.percentage >= 75
                                                                        ? "#00695C"
                                                                        : row.percentage >= 40
                                                                            ? "#FF8F00"
                                                                            : "#C62828",
                                                            }}
                                                        >
                                                            {row.percentage}%
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                borderRight: 1,
                                                                borderColor: "#E8DDEA",
                                                                textAlign: "center",
                                                                backgroundColor: "#fff",
                                                                fontWeight: "600",
                                                                color:
                                                                    row.rank === "A1" || row.rank === "A2"
                                                                        ? "#00695C"
                                                                        : row.rank === "B1" || row.rank === "B2"
                                                                            ? "#1976D2"
                                                                            : row.rank === "C1" || row.rank === "C2"
                                                                                ? "#FF8F00"
                                                                                : row.rank === "D"
                                                                                    ? "#6D4C41"
                                                                                    : "#C62828",
                                                            }}
                                                        >
                                                            {row.rank || "-"}
                                                        </TableCell>


                                                        <TableCell
                                                            sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}
                                                        >
                                                            <Button
                                                                onClick={() => handleAdd(row.rollnumber)}
                                                                sx={{ py: 0.1, textTransform: "none", borderRadius: "30px" }}
                                                            >
                                                                View
                                                            </Button>

                                                            <Dialog
                                                                open={openAlert === row.rollnumber}
                                                                onClose={() => setOpenAlert(null)}
                                                                maxWidth="sm"
                                                                fullWidth
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        justifyContent: "center",
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
                                                                            Comment
                                                                        </Typography>
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: "14px",
                                                                                fontWeight: 'bold',
                                                                                marginBottom: 1,
                                                                                pb: 1,
                                                                                color: row.teacherNotes ? "black" : "gray",
                                                                            }}
                                                                        >
                                                                            {row.teacherNotes || "No teacher notes available"}
                                                                        </Typography>

                                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                            <Button
                                                                                variant="outlined"
                                                                                onClick={() => setOpenAlert(null)}
                                                                                sx={{
                                                                                    position: "absolute",
                                                                                    textTransform: 'none',
                                                                                    border: "1px solid black",
                                                                                    color: "black",
                                                                                    borderRadius: '30px',
                                                                                    fontSize: '16px',
                                                                                    padding: '0px 35px',
                                                                                    bottom: "20px"
                                                                                }}
                                                                            >
                                                                                Close
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
                                                )
                                            })
                                        )
                                        }

                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Grid>
                    </Grid>


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
