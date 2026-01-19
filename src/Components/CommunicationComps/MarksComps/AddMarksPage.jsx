import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar, TextareaAutosize, Select, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { display, keyframes, useMediaQuery, useTheme } from "@mui/system";
import dayjs from "dayjs";
import Loader from "../../Loader";
import axios from "axios";
import { fetchAllMarksStudents, fetchAllMarksStudents02, MarksStudentsFetch, postAttendance, postMarks, sectionsDropdown, updateAttendance } from "../../../Api/Api";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import * as XLSX from 'xlsx';
import { Link } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../../SnackBar";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import fallbackImage from '../../../Images/PagesImage/dummy-image.jpg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';

export default function AddMarksPage() {
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
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [examOptions, setExamsOptions] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [getData, setGetData] = useState([]);
    const [isPosted, setIsPosted] = useState('N');
    const [getDataStudents, setGetDataStudents] = useState([]);
    const [getDataSubjects, setGetDataSubjects] = useState([]);
    const [secondarySubjects, setSecondarySubjects] = useState([]);
    const [getDraftSubjects, setGetDraftSubjects] = useState([]);
    const [totalMarks, setTotalMarks] = useState("");
    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const exams = selectedGrade?.exams?.map((exam) => ({ examName: exam })) || [];
    const groupOptions =
        selectedGrade?.sectionGroups?.find(sec => sec.section === selectedSection)?.groups || [];

    const [maxMarks, setMaxMarks] = useState(null);
    const fileInputRef = useRef(null);
    const [sortByNameAsc, setSortByNameAsc] = useState(false);

    useEffect(() => {
        if (grades && grades.length > 0) {
            const defaultGrade = grades[0];
            const defaultExams = defaultGrade.exams?.map(e => e.exam) || [];
            setExamsOptions(defaultExams);
            const firstGrade = grades[0];
            const firstSection = firstGrade.sections?.[0] || "";
            const firstExamObj = firstGrade.exams?.[0] || null;

            if (firstGrade && firstExamObj) {
                setSelectedGradeId(firstGrade.id);
                setSelectedSection(firstSection);
                setSelectedExam(firstExamObj.exam);
                setExamsOptions(defaultExams);
            }
        }
    }, [grades]);

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

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

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

    const handleImport = () => {
        fileInputRef.current.click();
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
    
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    
            const normalize = (str) => str?.replace(/\s+/g, "").toLowerCase();
    
            const normalizedPrimary = getDataSubjects.map((s) => ({
                original: s,
                normalized: normalize(s),
            }));
    
            const normalizedSecondary = secondarySubjects.map((s) => ({
                original: s,
                normalized: normalize(s),
            }));
    
            const newMarks = {};
    
            rows.forEach((row) => {
                const roll = String(row["Roll Number"] || row["rollnumber"] || "").trim();
                if (!roll) return;
    
                const subjects = {};
                const secondary = {};
    
                Object.entries(row).forEach(([key, value]) => {
                    if (["Roll Number", "rollnumber", "Name", "Student Name"].includes(key)) return;
    
                    const normalizedKey = normalize(key);
                    let markValue = (value ?? "").toString().trim().toUpperCase();
                    if (markValue === "A") markValue = "AB";
    
                    if (markValue === "AB") {
                      
                    } else if (!isNaN(Number(markValue))) {
                        markValue = Number(markValue);
                    } else {
                        markValue = "";
                    }
    
                    const primaryMatch = normalizedPrimary.find(
                        (subj) => subj.normalized === normalizedKey
                    );
                    const secondaryMatch = normalizedSecondary.find(
                        (subj) => subj.normalized === normalizedKey
                    );
    
                    if (primaryMatch) {
                        subjects[primaryMatch.original] = markValue;
                    } else if (secondaryMatch) {
                        secondary[secondaryMatch.original] = markValue;
                    }
                });
    
                let totalMarks = 0;
                let isPass = true;
    
                Object.values(subjects).forEach((m) => {
                    if (m === "AB") isPass = false;
                    else if (typeof m === "number") {
                        totalMarks += m;
                        if (m < 35) isPass = false;
                    }
                });
    
                const subjectCount = getDataSubjects.length;
                const limit = Number(maxMarks || 100);
                const maxMarksTotal = subjectCount * limit;
                const percentage = subjectCount ? (totalMarks / maxMarksTotal) * 100 : 0;
    
                newMarks[roll] = {
                    subjects,
                    secondary,
                    TotalMarks: totalMarks,
                    Percentage: percentage,
                    Grade: getGrade(percentage),
                    Status: isPass ? "Pass" : "Fail",
                };
            });
    
            setMarks((prev) => ({ ...prev, ...newMarks }));
            e.target.value = ""; 
        };
    
        reader.readAsArrayBuffer(file);
    };
    

    const getGrade = (percentage) => {
        if (percentage >= 91) return "A1";
        if (percentage >= 81) return "A2";
        if (percentage >= 71) return "B1";
        if (percentage >= 61) return "B2";
        if (percentage >= 51) return "C1";
        if (percentage >= 41) return "C2";
        if (percentage >= 33) return "D";
        if (percentage >= 21) return "E1";
        return "E2";
    };

    const handleMarksChange = (rollNumber, subject, value, isSecondary = false) => {
        let v = (value ?? "").toUpperCase();
        if (v === "A") v = "AB";

        const isEmpty = v === "";
        const isAB = v === "AB";
        const isDigits = /^\d{0,3}$/.test(v);

        const limit = Number(maxMarks || 100);

        if (!isEmpty && !isAB && !isDigits) return;
        if (isDigits && v !== "" && Number(v) > limit) return;

        setMarks((prevMarks) => {
            const updatedMarks = { ...prevMarks };
            if (!updatedMarks[rollNumber]) {
                updatedMarks[rollNumber] = {
                    subjects: {},
                    secondary: {},
                    TotalMarks: 0,
                    Percentage: 0,
                    Status: "Pass",
                };
            }

            const target =
                isSecondary && secondarySubjects?.length
                    ? updatedMarks[rollNumber].secondary
                    : updatedMarks[rollNumber].subjects;

            if (isEmpty) {
                target[subject] = "";
            } else if (isAB) {
                target[subject] = "AB";
            } else {
                target[subject] = Number(v);
            }

            let totalMarks = 0;
            let isPass = true;

            Object.values(updatedMarks[rollNumber].subjects).forEach((mark) => {
                if (mark === "AB") {
                    isPass = false;
                } else if (typeof mark === "number" && !isNaN(mark)) {
                    totalMarks += mark;
                    if (mark < 35) isPass = false;
                }
            });

            const subjectCount = getDataSubjects.length;
            const maxMarksTotal = subjectCount * limit;
            const percentage = subjectCount ? (totalMarks / maxMarksTotal) * 100 : 0;

            updatedMarks[rollNumber].TotalMarks = totalMarks;
            updatedMarks[rollNumber].Percentage = percentage;
            updatedMarks[rollNumber].Grade = getGrade(percentage);
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
        const totalMarks = subjectCount * Number(maxMarks || 0);
        return totalMarks;
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
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

    const isFormValid = () => {
        return getDataStudents.every((row) => {
            const studentMarks = marks[row.rollNumber] || marks[row.rollnumber];
            if (!studentMarks) return false;

            const totalMarks = studentMarks.TotalMarks ?? studentMarks.totalMarks;
            if (totalMarks === undefined || totalMarks === null || String(totalMarks).trim() === '') {
                return false;
            }

            const subjects = studentMarks.subjects || {};
            const secondary = studentMarks.secondary || {};

            if (Object.keys(subjects).length === 0 && Object.keys(secondary).length === 0) return false;

            const isValidMark = (mark) => {
                if (mark === null || mark === undefined) return false;
                const s = String(mark).trim();
                if (s === '') return false;
                if (s.toUpperCase() === 'AB') return true;
                return !Number.isNaN(Number(s));
            };

            const allValidSubjects = Object.values(subjects).every(isValidMark);
            const allValidSecondary = Object.values(secondary).every(isValidMark);

            return allValidSubjects && allValidSecondary;
        });
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
    }, [selectedGradeId, selectedSection, selectedGroup, selectedExam]);

    const handleFetch = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(MarksStudentsFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    GradeId: selectedGradeId || grades?.[0]?.id,
                    Section: selectedSection || grades?.[0]?.sections[0],
                    Exam: selectedExam || grades?.[0]?.exams[0],
                    Group: selectedGroup,
                },

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGetData(res.data)
            setIsPosted(res.data.isPosted)
            setGetDataStudents(res.data.students || [])
            setGetDataSubjects(res.data.subjects || []);
            setSecondarySubjects(res.data.secondarySubjects || [])
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const sortedStudents = sortByNameAsc
        ? [...getDataStudents].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        : [...getDataStudents].sort((a, b) => (b.name || '').localeCompare(a.name || ''));



    useEffect(() => {
        if (selectedGradeId && isPosted !== "" && getDataSubjects.length > 0) {
            const status = isPosted === "Y" ? "post" : "draft";
            handleFetchDraft(status);
        }
    }, [selectedGradeId, isPosted, selectedSection, selectedExam, selectedGroup, getDataSubjects]);



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
                rank: marks[row.rollNumber]?.Grade || getGrade(studentMarks.Percentage),
                remarks: studentMarks.Status || "Nill",
                teacherNotes: comments[row.rollNumber] || "",
                ...getDataSubjects.reduce((subjects, subject) => {
                    const subjectKey = subject.replace(/\s+/g, '');
                    subjects[subjectKey] =
                        studentMarks.subjects?.[subjectKey] !== undefined
                            ? String(studentMarks.subjects[subjectKey])
                            : "0";
                    return subjects;
                }, {}),
                ...(secondarySubjects?.length
                    ? secondarySubjects.reduce((secondary, subject) => {
                        const subjectKey = subject.replace(/\s+/g, '');
                        secondary[subjectKey] =
                            studentMarks.secondary?.[subjectKey] !== undefined
                                ? String(studentMarks.secondary[subjectKey])
                                : "0";
                        return secondary;
                    }, {})
                    : {}),

            };
        });

        const payload = {
            gradeId: selectedGradeId || grades?.[0]?.id,
            status: status,
            MaxMark: maxMarks || 100,
            group: selectedGroup || "",
            all_marksRequest,
        };

        try {
            await axios.post(postMarks, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            handleFetch();
            handleFetchDraft();
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

    // const handleSaveMarks = async (status) => {
    //     setIsLoading(true);

    //     const all_marksRequest = getDataStudents.map((row) => {
    //         const studentMarks = marks[row.rollNumber] || {};

    //         return {
    //             examName: selectedExam,
    //             rollnumber: row.rollNumber,
    //             studentName: row.name,
    //             grade: row.grade,
    //             section: row.section,
    //             profile: row.profile || "",
    //             totalMarks: calculateTotalMarks(),
    //             marksScored: studentMarks.TotalMarks || 0,
    //             percentage: studentMarks.Percentage ? Math.floor(studentMarks.Percentage) : 0,
    //             rank: marks[row.rollNumber]?.Grade || getGrade(studentMarks.Percentage),
    //             remarks: studentMarks.Status || "Nill",
    //             teacherNotes: comments[row.rollNumber] || "",
    //             ...getDataSubjects.reduce((subjects, subject) => {
    //                 const subjectKey = subject.toLowerCase();
    //                 subjects[subjectKey] =
    //                     studentMarks.subjects?.[subjectKey] !== undefined
    //                         ? String(studentMarks.subjects[subjectKey])
    //                         : "0";
    //                 return subjects;
    //             }, {}),
    //             ...(secondarySubjects?.length
    //                 ? secondarySubjects.reduce((secondary, subject) => {
    //                     const subjectKey = subject.toLowerCase();
    //                     secondary[subjectKey] =
    //                         studentMarks.secondary?.[subjectKey] !== undefined
    //                             ? String(studentMarks.secondary[subjectKey])
    //                             : "0";
    //                     return secondary;
    //                 }, {})
    //                 : {}),
    //         };
    //     });

    //     const payload = {
    //         gradeId: selectedGradeId || grades?.[0]?.id,
    //         status: status,
    //         MaxMark: maxMarks || 100,
    //         group: selectedGroup || "",
    //         all_marksRequest,
    //     };

    //     try {
    //         await axios.post(postMarks, payload, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         handleFetch();
    //         handleFetchDraft();
    //         setOpen(true);
    //         setColor(true);
    //         setStatus(true);
    //         setMessage("Added Successfully");
    //     } catch (error) {
    //         console.error("Error saving:", error);
    //         setOpen(true);
    //         setColor(false);
    //         setStatus(false);
    //         setMessage("Failed to add data. Please try again.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleFetchDraft = async (status) => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchAllMarksStudents02, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    GradeId: selectedGradeId || grades?.[0]?.id,
                    Section: selectedSection || grades?.[0]?.sections[0],
                    Exam: selectedExam || grades?.[0]?.exams[0],
                    Group: selectedGroup || "",
                    Status: status,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const studentList = res.data.students || [];
            // let apiMaxMark = 100;
            // if (studentList.length > 0) {
            //     apiMaxMark = Number(studentList[0].maxMark) || 100;
            //     setMaxMarks(apiMaxMark);
            // }

            let apiMaxMark = 100;
            if (studentList.length > 0) {
                const fetchedMax = Number(studentList[0].maxMark);
                apiMaxMark = !isNaN(fetchedMax) && fetchedMax > 0 ? fetchedMax : 100;
            }
            setMaxMarks(apiMaxMark);

            const normalize = (str) => str?.replace(/\s+/g, "").toLowerCase();

            const normalizedPrimary = getDataSubjects.map(normalize);
            const normalizedSecondary = secondarySubjects.map(normalize);

            const formattedMarks = {};
            const formattedComments = {};

            studentList.forEach((student) => {
                const subjectsRaw = student.subjects || {};
                const subjects = {};
                const secondary = {};

                Object.entries(subjectsRaw).forEach(([key, rawValue]) => {
                    const cleanKey = key.trim();
                    const normalizedKey = normalize(cleanKey);

                    const value =
                        rawValue === "AB"
                            ? "AB"
                            : isNaN(Number(rawValue))
                                ? 0
                                : Number(rawValue);

                    if (normalizedPrimary.includes(normalizedKey)) {

                        subjects[cleanKey] = value;
                    } else if (normalizedSecondary.includes(normalizedKey)) {

                        secondary[cleanKey] = value;
                    } else {

                        secondary[cleanKey] = value;
                    }
                });

                let totalMarks = 0;
                let isPass = true;

                Object.values(subjects).forEach((m) => {
                    if (m === "AB") {
                        isPass = false;
                    } else if (typeof m === "number") {
                        totalMarks += m;
                        if (m < 35) isPass = false;
                    }
                });

                const subjectCount = getDataSubjects.length;
                const maxMarksTotal = subjectCount * apiMaxMark;
                const percentage = subjectCount > 0 ? (totalMarks / maxMarksTotal) * 100 : 0;
                const grade = getGrade(percentage);

                formattedMarks[student.rollnumber] = {
                    subjects,
                    secondary,
                    TotalMarks: totalMarks,
                    Percentage: percentage,
                    Status: isPass ? "Pass" : "Fail",
                    Grade: grade,
                };

                formattedComments[student.rollnumber] = student.teacherNotes || "";
            });

            setMarks(formattedMarks);
            setComments(formattedComments);
        } catch (error) {
            console.error("Error fetching draft marks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleFetchDraft = async (status) => {
    //     setIsLoading(true);
    //     try {
    //         const res = await axios.get(fetchAllMarksStudents, {
    //             params: {
    //                 RollNumber: rollNumber,
    //                 UserType: userType,
    //                 GradeId: selectedGradeId || grades?.[0]?.id,
    //                 Section: selectedSection || grades?.[0]?.sections[0],
    //                 Exam: selectedExam || grades?.[0]?.exams[0],
    //                 Group: selectedGroup || "",
    //                 Status: status
    //             },
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         const requestKey = Object.keys(res.data).find((key) => key.endsWith("Request"));
    //         const studentList = res.data[requestKey] || [];

    //         let apiMaxMark = 100;
    //         if (studentList.length > 0) {
    //             apiMaxMark = Number(studentList[0].maxMark) || 100;
    //             setMaxMarks(apiMaxMark);
    //         }

    //         const apiSubjects = (getDataSubjects || []).map(subj => subj.toLowerCase());
    //         const hasSecondary = secondarySubjects && secondarySubjects.length > 0;
    //         const apiSecondary = hasSecondary ? secondarySubjects.map(subj => subj.toLowerCase()) : [];

    //         const formattedMarks = {};
    //         const formattedComments = {};

    //         studentList.forEach((student) => {
    //             const subjects = {};
    //             const secondary = {};

    //             apiSubjects.forEach((subj) => {
    //                 const key = Object.keys(student).find((k) => k.toLowerCase() === subj);
    //                 if (key && student[key] !== null) {
    //                     const value = student[key];
    //                     subjects[subj] = value === "AB" ? "AB" : Number(value) || 0;
    //                 }
    //             });

    //             if (hasSecondary) {
    //                 apiSecondary.forEach((subj) => {
    //                     const key = Object.keys(student).find((k) => k.toLowerCase() === subj);
    //                     if (key && student[key] !== null) {
    //                         const value = student[key];
    //                         secondary[subj] = value === "AB" ? "AB" : Number(value) || 0;
    //                     }
    //                 });
    //             }

    //             let totalMarks = 0;
    //             let isPass = true;

    //             Object.values(subjects).forEach((m) => {
    //                 if (m === "AB") {
    //                     isPass = false;
    //                 } else {
    //                     totalMarks += m;
    //                     if (m < 35) isPass = false;
    //                 }
    //             });

    //             const maxMarksTotal = Object.keys(subjects).length * apiMaxMark;
    //             const percentage = maxMarksTotal > 0 ? (totalMarks / maxMarksTotal) * 100 : 0;
    //             const grade = getGrade(percentage);

    //             formattedMarks[student.rollnumber] = {
    //                 subjects,
    //                 secondary,
    //                 TotalMarks: totalMarks,
    //                 Percentage: percentage,
    //                 Status: isPass ? "Pass" : "Fail",
    //                 Grade: grade,
    //             };

    //             formattedComments[student.rollnumber] = student.teacherNotes || "";
    //         });

    //         setMarks(formattedMarks);
    //         setComments(formattedComments);
    //     } catch (error) {
    //         console.error("Error fetching draft marks:", error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    return (
        <Box sx={{
            backgroundColor: "#F6F6F8", height: {
                xs: "100%",
            }
        }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box>
                <Grid container sx={{ backgroundColor: "#f2f2f2", py: 1, px: 2, borderBottom: "1px solid #ddd", }} >
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
                                    lg: 2.4
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
                                    // disabled
                                    variant="outlined"
                                    sx={{
                                        borderColor: "#A9A9A9",
                                        boder: "1px solid black",
                                        height: "33px",
                                        width: "100%",
                                        color: "#000",
                                        textTransform: "none",
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
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>

                {/* <Box hidden={value !== 0}> */}
                <Box sx={{ px: 2, pb:3}}>
                    <Grid container columnSpacing={2} sx={{ display: "flex", justifyContent: "end", mt: 0.5 }}>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                lg: 2
                            }}
                        >
                            <TextField
                                size="small"
                                placeholder="Max Mark"
                                value={maxMarks === null || maxMarks === undefined ? "" : maxMarks}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (val === "") {
                                        setMaxMarks("");
                                        return;
                                    }

                                    const num = Number(val);
                                    if (!isNaN(num) && num >= 1 && num <= 100) {
                                        setMaxMarks(num);
                                    }
                                }}
                                onBlur={() => {
                                    if (maxMarks === "" || maxMarks === null || maxMarks === undefined || isNaN(Number(maxMarks))) {
                                        setMaxMarks(100);
                                    }
                                }}
                                inputProps={{
                                    min: 1,
                                    max: 100,
                                    inputMode: "numeric",
                                }}
                                sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": { height: "30px" },
                                    "& .MuiInputBase-input": {
                                        fontWeight: 600,
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
                                <Box sx={{ display: "flex", marginTop: "-14px", width: "200px", }}>
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
                                                    width: "150px",
                                                }}
                                            >
                                                <Button
                                                    onClick={() => setSortByNameAsc((prev) => !prev)}
                                                    sx={{
                                                        gap: "4px",
                                                        textTransform: "none",
                                                        color: "#000",
                                                        fontWeight: 600,
                                                        fontSize: "14px",
                                                        minWidth: "auto",
                                                        padding: 0,
                                                        "&:hover": {
                                                            backgroundColor: "transparent",
                                                            color: "#3f51b5",
                                                        },
                                                    }}
                                                    endIcon={
                                                        sortByNameAsc ? (
                                                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                                                        ) : (
                                                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                                                        )
                                                    }
                                                >
                                                    Student Name
                                                </Button>
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
                                            {getDataSubjects.map((subject) => (
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
                                            {/* <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    width: "100px",
                                                }}
                                            >
                                                Remarks
                                            </TableCell> */}
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
                                            {/* <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F3FE",
                                                    width: "100px",
                                                }}
                                            >
                                                Export
                                            </TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedStudents.map((row, index) => (
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
                                                        color: "#37474F",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {calculateTotalMarks(row.rollNumber)}
                                                </TableCell>

                                                {[
                                                    ...getDataSubjects,
                                                    ...(secondarySubjects && secondarySubjects.length > 0 ? secondarySubjects : []),
                                                ].map((subject) => {
                                                    const roll = String(row.rollNumber);

                                                    const normalize = (str) => str?.replace(/\s+/g, "").toLowerCase();

                                                    const isSecondary =
                                                        secondarySubjects &&
                                                        secondarySubjects.some((sec) => normalize(sec) === normalize(subject));

                                                    const normalizedSubjectKey = normalize(subject);

                                                    const subjectKey =
                                                        Object.keys(isSecondary ? marks[roll]?.secondary || {} : marks[roll]?.subjects || {}).find(
                                                            (key) => normalize(key) === normalizedSubjectKey
                                                        ) || subject;

                                                    const value = isSecondary
                                                        ? marks[roll]?.secondary?.[subjectKey] ?? ""
                                                        : marks[roll]?.subjects?.[subjectKey] ?? "";

                                                    return (
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
                                                                value={value}
                                                                onChange={(e) =>
                                                                    handleMarksChange(roll, subjectKey, e.target.value, isSecondary)
                                                                }
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    sx: {
                                                                        textAlign: "center",
                                                                        color: value === "AB" ? "red" : "#424242",
                                                                    },
                                                                }}
                                                                sx={{
                                                                    "& .MuiInputBase-input": {
                                                                        textAlign: "center",
                                                                    },
                                                                }}
                                                                inputProps={{ maxLength: 3 }}
                                                            />
                                                        </TableCell>
                                                    );
                                                })}

                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                        fontWeight: "600",
                                                        // color:
                                                        //     marks[row.rollNumber]?.Status === undefined || marks[row.rollNumber]?.Status === "Nill"
                                                        //         ? "black"
                                                        //         : marks[row.rollNumber]?.Status === "Fail"
                                                        //             ? "red"
                                                        //             : "green",
                                                        color: "black",
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
                                                        fontWeight: "600",
                                                        color:
                                                            marks[row.rollNumber]?.Percentage >= 75
                                                                ? "#00695C"
                                                                : marks[row.rollNumber]?.Percentage >= 40
                                                                    ? "#FF8F00"
                                                                    : "#C62828",
                                                    }}
                                                >
                                                    {marks[row.rollNumber]?.Percentage
                                                        ? `${Math.floor(marks[row.rollNumber].Percentage)}%`
                                                        : "0%"}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                        fontWeight: "600",
                                                        color:
                                                            marks[row.rollNumber]?.Grade === "A1" || marks[row.rollNumber]?.Grade === "A2"
                                                                ? "#00695C"
                                                                : marks[row.rollNumber]?.Grade === "B1" || marks[row.rollNumber]?.Grade === "B2"
                                                                    ? "#1976D2"
                                                                    : marks[row.rollNumber]?.Grade === "C1" || marks[row.rollNumber]?.Grade === "C2"
                                                                        ? "#FF8F00"
                                                                        : marks[row.rollNumber]?.Grade === "D"
                                                                            ? "#6D4C41"
                                                                            : "#C62828",

                                                    }}
                                                >
                                                    {marks[row.rollNumber]?.Grade ?? "-"}
                                                </TableCell>

                                                {/* <TableCell
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
                                                </TableCell> */}

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

                                                {/* <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#fff" }}>
                                                    <IconButton onClick={() => handleExportSingleData(row)}>
                                                        <PrintIcon style={{ color: "#000" }} />
                                                    </IconButton>
                                                </TableCell> */}
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
                            disabled={isPosted === "Y"}
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
                            Save
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
                            {isPosted === "N" ? "Publish" : "Update"}
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
                        src={imageUrl || fallbackImage}
                        alt="Popup"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                        }}
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
