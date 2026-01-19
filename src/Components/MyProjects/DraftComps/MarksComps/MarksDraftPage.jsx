import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, Button, Grid, DialogActions, TextField,  Autocomplete} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { display, keyframes, useMediaQuery, useTheme } from "@mui/system";
import dayjs from "dayjs";
import Loader from "../../../Loader";
import axios from "axios";
import { fetchAllMarksStudents, } from "../../../../Api/Api";
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
import { Link, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../../../SnackBar";
import { selectGrades } from "../../../../Redux/Slices/DropdownController";


export default function MarksDraftPage() {
    const today = dayjs().format("DD-MM-YYYY");

    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const theme = useTheme();
    const [selectedActions, setSelectedActions] = useState({});

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const selectedGradeId = "131"
    const [sections, setSections] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);

    const [openAlert, setOpenAlert] = useState(false);
    const [getData, setGetData] = useState([]);
    const [getDataSubjects, setGetDataSubjects] = useState([]);
    const [totalMarks, setTotalMarks] = useState("");
    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const { grade, gradeId } = location.state || {};
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {

        if (grades && grade && gradeId) {
            const selectedGrade = grades.find(
                (g) => g.sign === grade && g.id === Number(gradeId)
            );

            if (selectedGrade) {
                console.log("Selected Grade:", selectedGrade);

                const mappedSections = selectedGrade.sections.map((section) => ({
                    sectionName: section,
                }));
                const mappedExams = selectedGrade.exams.map((exam) => ({
                    sectionName: exam,
                }));

                setSections(mappedSections);
                setExams(mappedExams);
                setSubjects(selectedGrade.subjects || []);

                if (mappedSections.length > 0) {
                    setSelectedSection(mappedSections[0].sectionName);
                }
                if (mappedExams.length > 0) {
                    setSelectedExam(mappedExams[0].sectionName);
                }
            } else {
                console.warn("No matching grade found");
                setSections([]);
                setExams([]);
                setSubjects([]);
            }
        } else {
            console.warn("Missing grade or gradeId in state");
        }
    }, [grade, gradeId, grades]);

    const handleSectionChange = (event, value) => {
        setSelectedSection(value ? value.sectionName : null);
    };

    const handleExamChange = (event, value) => {
        setSelectedExam(value ? value.sectionName : null);
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

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleCancel = () => {
        setSelectedActions({});
    };

    const handleTotalMarksChange = (event) => {
        const value = event.target.value;
        setTotalMarks(value);
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

        const data = viewData.map((row, index) => {
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
            'Percentage',
            'Status',
            'Comments',
            ...subjects,
            'Marks Scored',
        ];

        const data = [
            [
                1,
                studentData.rollnumber,
                studentData.studentName,
                studentData.grade,
                studentData.section,
                studentData.percentage ? `${Math.floor(studentData.percentage)}%` : '0%',
                studentData.remarks || 'Nill',
                studentData.teacherNotes || "No comments",
                ...subjects.map((subject) => studentData[subject.toLowerCase()] || 0),
                studentData.marksScored || 0,
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student Data');

        XLSX.writeFile(wb, `${studentData.studentName}_data.xlsx`);
    };

    useEffect(() => {
        console.log("Fetching data for section:", selectedSection, "and exam:", selectedExam);
        handleFetch();
    }, [selectedSection, selectedExam]);

    const handleFetch = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchAllMarksStudents, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    GradeId: gradeId || "131",
                    Section: selectedSection || "A1",
                    Exam: selectedExam || "",
                },

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGetData(res.data)
            console.log("Data fetched successfully:", res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const requestKey = Object.keys(getData).find((key) => key.endsWith('Request'));
    const viewData = getData[requestKey] || [];
    console.log("Current viewData:", viewData);

    return (
        <Box sx={{ backgroundColor: "#F6F6F8", height: {
            xs: "100%",
            lg: "91.5vh",} }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box p={3}>
                <Grid container >
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4
                        }}>
                        <Grid container >
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
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
                        </Grid>


                    </Grid>



                    <Grid
                        sx={{ mt: 0.5, pl: 3 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 4,
                            lg: 8
                        }}>
                        <Grid container spacing={2}>

                            <Grid
                                size={{
                                    lg: 3
                                }}>
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
                                    lg: 3,
                                    md: 6,
                                    sm: 12
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={exams}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        selectedExam
                                            ? { sectionName: selectedExam }
                                            : null
                                    }
                                    onChange={handleExamChange}
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
                                                Total Marks
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

                                        {
                                            viewData.map((row, index) => {
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
                                                                color: "#E60154"
                                                            }}
                                                        >
                                                            {row.totalMarks}
                                                        </TableCell>
                                                        {subjects.map((subject) => (
                                                            <TableCell
                                                                key={`${row.rollnumber}-${subject}`}
                                                                sx={{
                                                                    borderRight: 1,
                                                                    borderColor: "#E8DDEA",
                                                                    textAlign: "center",
                                                                    padding: "0px",
                                                                    minWidth: "90px",
                                                                    backgroundColor: "#fff",
                                                                }}
                                                            >
                                                                {row[subject.toLowerCase()]}
                                                            </TableCell>
                                                        ))}
                                                        <TableCell
                                                            sx={{
                                                                borderRight: 1,
                                                                borderColor: "#E8DDEA",
                                                                textAlign: "center",
                                                                backgroundColor: "#fff",
                                                                color:
                                                                    row.remarks === "Pass" ? "green" : row.remarks === "Fail" ? "red" : "black"
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
                                                                color:
                                                                    row.remarks === "Pass" ? "green" : row.remarks === "Fail" ? "red" : "black"

                                                            }}
                                                        >
                                                            {row.remarks || "Nill"}
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
                                                                                    position:"absolute",
                                                                                    textTransform: 'none',
                                                                                    border: "1px solid black",
                                                                                    color: "black",
                                                                                    borderRadius: '30px',
                                                                                    fontSize: '16px',
                                                                                    padding: '0px 35px',
                                                                                    bottom:"20px"
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
