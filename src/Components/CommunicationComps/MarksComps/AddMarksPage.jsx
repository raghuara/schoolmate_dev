import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar, TextareaAutosize, Select, MenuItem, Skeleton, Tooltip, Popover } from "@mui/material";
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
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { selectHasPermission } from "../../../Redux/Slices/AuthSlice";
import fallbackImage from '../../../Images/PagesImage/dummy-image.jpg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

export default function AddMarksPage() {
    const today = dayjs().format("DD-MM-YYYY");
    const token = '123';
    const user = useSelector((state) => state.auth);
    const canCreateMarks = useSelector(selectHasPermission('communication', 'marks', 'create'));
    const canEditMarks = useSelector(selectHasPermission('communication', 'marks', 'edit'));
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    // Only the student table - lets it show skeleton rows instead of greying
    // the whole screen behind the overlay loader.
    const [isTableLoading, setIsTableLoading] = useState(true);
    // Anchor for the "how import works" popover.
    const [howAnchor, setHowAnchor] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const theme = useTheme();
    const websiteSettings = useSelector(selectWebsiteSettings);
    // The API rejects marks requests without it - format YYYY-YYYY.
    const academicYear = useSelector(selectAcademicYear);
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

    const notify = (msg, ok = false) => {
        setMessage(msg);
        setColor(ok);
        setStatus(ok);
        setOpen(true);
    };

    const handleDownloadTemplate = () => {
        const subjectColumns = [...(getDataSubjects || []), ...(secondarySubjects || [])];

        if (isTableLoading) {
            notify("Still loading this class - try again in a moment.");
            return;
        }

        if (!getDataStudents.length) {
            notify("No students found for the selected class, section and exam.");
            return;
        }

        if (!subjectColumns.length) {
            notify("No subjects found for the selected class.");
            return;
        }

        const limit = Number(maxMarks || 100);

        const header = ["Roll Number", "Student Name", ...subjectColumns];
        const rows = getDataStudents.map((student) => [
            student.rollNumber,
            student.name,
            ...subjectColumns.map(() => ""),
        ]);

        const marksSheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
        marksSheet["!cols"] = [
            { wch: 14 },
            { wch: 26 },
            ...subjectColumns.map((subject) => ({ wch: Math.max(12, subject.length + 4) })),
        ];

        const instructionsSheet = XLSX.utils.aoa_to_sheet([
            ["Marks Import Template"],
            [],
            ["Class", selectedGrade?.sign || ""],
            ["Section", selectedSection || ""],
            ["Exam", selectedExam || ""],
            ["Maximum marks per subject", limit],
            ["Students", getDataStudents.length],
            [],
            ["How to use"],
            ["1. Enter marks in the 'Marks' sheet only. Do not rename, reorder or delete the columns."],
            ["2. Do not edit the Roll Number column - marks are matched to students using it."],
            ["3. Enter a number between 0 and " + limit + " for each subject."],
            ["4. Enter AB (or A) if the student was absent."],
            ["5. Leave a cell blank to skip that subject - blank cells are ignored on import."],
            ["6. Save the file, then use the Import button on the Add Marks screen."],
        ]);
        instructionsSheet["!cols"] = [{ wch: 30 }, { wch: 22 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, marksSheet, "Marks");
        XLSX.utils.book_append_sheet(wb, instructionsSheet, "Instructions");

        const namePart = [selectedGrade?.sign, selectedSection, selectedExam]
            .filter(Boolean)
            .join("_")
            .replace(/\s+/g, "-");

        XLSX.writeFile(wb, `Marks_Template_${namePart || "All"}.xlsx`);
    };

    const handleImport = () => {
        if (isTableLoading) {
            notify("Still loading this class - try again in a moment.");
            return;
        }
        if (!getDataStudents.length) {
            notify("Load a class, section and exam before importing marks.");
            return;
        }
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

                    } else if (markValue !== "" && !isNaN(Number(markValue))) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGradeId, selectedSection, selectedGroup, selectedExam, academicYear]);

    const handleFetch = async () => {
        setIsLoading(true);
        setIsTableLoading(true);
        try {
            const res = await axios.get(MarksStudentsFetch, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    gradeId: selectedGradeId || grades?.[0]?.id,
                    section: selectedSection || grades?.[0]?.sections[0],
                    exam: selectedExam || grades?.[0]?.exams[0],
                    group: selectedGroup,
                    academicYear: academicYear,
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
            // Clear the roster - otherwise the previous class stays on screen
            // and gets exported or imported against the wrong students.
            setGetData([]);
            setIsPosted("");
            setGetDataStudents([]);
            setGetDataSubjects([]);
            setSecondarySubjects([]);
            setMarks({});
            setComments({});
            notify(error.response?.data?.message || "Could not load students for this selection.");
        } finally {
            setIsLoading(false);
            setIsTableLoading(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGradeId, isPosted, selectedSection, selectedExam, selectedGroup, getDataSubjects, academicYear]);



    const isUpdatingPostedMarks = isPosted === "Y";
    const canSubmitMarks = isUpdatingPostedMarks ? canEditMarks : canCreateMarks;

    const handleSaveMarks = async (status) => {
        if (!canSubmitMarks) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("You don't have permission to perform this action.");
            return;
        }
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
            maxMark: maxMarks || 100,
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
        setIsTableLoading(true);
        try {
            const res = await axios.get(fetchAllMarksStudents02, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    gradeId: selectedGradeId || grades?.[0]?.id,
                    section: selectedSection || grades?.[0]?.sections[0],
                    exam: selectedExam || grades?.[0]?.exams[0],
                    group: selectedGroup || "",
                    status: status,
                    academicYear: academicYear,
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
            setIsTableLoading(false);
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
            {isLoading && !isTableLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box>
                <Box
                    sx={{
                        backgroundColor: "#f2f2f2",
                        borderBottom: "1px solid #ddd",
                        py: 1,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        flexWrap: "wrap",
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Link style={{ textDecoration: "none" }} to="/dashboardmenu/marks">
                                <IconButton sx={{ width: "27px", height: "27px", marginTop: '3px' }}>
                                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                </IconButton>
                            </Link>
                            <Box sx={{ ml: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "20px", color: DASH.ink, lineHeight: 1.2 }}>
                                    Add Marks
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, whiteSpace: "nowrap" }}>
                                    Enter marks for a class, then save a draft or publish
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", ml: "auto", minWidth: 0 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 1,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box sx={{ width: { xs: "100%", sm: 150 } }}>
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
                                                    height: 34,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    borderRadius: RADIUS,
                                                    backgroundColor: "#fff",
                                                    "& fieldset": { borderColor: DASH.line },
                                                    "&:hover fieldset": { borderColor: DASH.faint },
                                                    "&.Mui-focused fieldset": { borderColor: websiteSettings.mainColor || DASH.primary, borderWidth: "1px" },
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                            <Box sx={{ width: { xs: "100%", sm: 150 } }}>
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
                                                    height: 34,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    borderRadius: RADIUS,
                                                    backgroundColor: "#fff",
                                                    "& fieldset": { borderColor: DASH.line },
                                                    "&:hover fieldset": { borderColor: DASH.faint },
                                                    "&.Mui-focused fieldset": { borderColor: websiteSettings.mainColor || DASH.primary, borderWidth: "1px" },
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
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
                                                    height: 34,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    borderRadius: RADIUS,
                                                    backgroundColor: "#fff",
                                                    "& fieldset": { borderColor: DASH.line },
                                                    "&:hover fieldset": { borderColor: DASH.faint },
                                                    "&.Mui-focused fieldset": { borderColor: websiteSettings.mainColor || DASH.primary, borderWidth: "1px" },
                                                },
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            )} */}

                            <Box sx={{ width: { xs: "100%", sm: 150 } }}>
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
                                                    height: 34,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    borderRadius: RADIUS,
                                                    backgroundColor: "#fff",
                                                    "& fieldset": { borderColor: DASH.line },
                                                    "&:hover fieldset": { borderColor: DASH.faint },
                                                    "&.Mui-focused fieldset": { borderColor: websiteSettings.mainColor || DASH.primary, borderWidth: "1px" },
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>

                            <Box sx={{ width: { xs: "48%", sm: 118 } }}>
                                <Tooltip title="Download this class as a spreadsheet to fill in" arrow>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            height: 34,
                                            width: "100%",
                                            textTransform: "none",
                                            fontSize: "12.5px",
                                            fontWeight: 700,
                                            color: DASH.text,
                                            bgcolor: "#fff",
                                            borderColor: DASH.line,
                                            borderRadius: RADIUS,
                                            "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                        }}
                                        onClick={handleDownloadTemplate}
                                    >
                                        <FileDownloadOutlinedIcon sx={{ fontSize: "20px" }} />
                                        &nbsp;Format
                                    </Button>
                                </Tooltip>
                            </Box>

                            <Box sx={{ width: { xs: "48%", sm: 118 } }}>
                                <Tooltip title="Upload the filled spreadsheet - marks are matched by roll number" arrow>
                                    <Button
                                        // disabled
                                        variant="outlined"
                                        sx={{
                                            height: 34,
                                            width: "100%",
                                            textTransform: "none",
                                            fontSize: "12.5px",
                                            fontWeight: 700,
                                            color: DASH.cyan,
                                            bgcolor: DASH.cyanLight,
                                            borderColor: "#A5F3FC",
                                            borderRadius: RADIUS,
                                            "&:hover": { bgcolor: DASH.cyanLight, borderColor: DASH.cyan },
                                        }}
                                        onClick={handleImport}
                                    >
                                        <BackupOutlinedIcon sx={{ fontSize: "20px" }} />
                                        &nbsp;Import
                                    </Button>
                                </Tooltip>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </Box>

                        </Box>
                    </Box>
                </Box>

                {/* <Box hidden={value !== 0}> */}
                <Box sx={{ px: 2, pt: 1.5, pb: 3 }}>
                    <Grid container columnSpacing={2} rowSpacing={1} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>

                        {/* The steps live behind a link - read once, then out of the way. */}
                        <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ display: "flex", alignItems: "flex-start", pt: 0.4 }}>
                            <Button
                                onClick={(e) => setHowAnchor(e.currentTarget)}
                                startIcon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "11.5px",
                                    fontWeight: 700,
                                    height: 28,
                                    px: 1.4,
                                    borderRadius: "50px",
                                    color: DASH.cyan,
                                    bgcolor: DASH.cyanLight,
                                    border: "1px solid #A5F3FC",
                                    "& .MuiButton-startIcon": { mr: 0.6 },
                                    "&:hover": { bgcolor: DASH.cyanLight, borderColor: DASH.cyan },
                                }}
                            >
                                How Format &amp; Import work
                            </Button>

                            <Popover
                                open={Boolean(howAnchor)}
                                anchorEl={howAnchor}
                                onClose={() => setHowAnchor(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                transformOrigin={{ vertical: "top", horizontal: "left" }}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            mt: 0.8,
                                            maxWidth: 340,
                                            borderRadius: "10px",
                                            border: `1px solid ${DASH.line}`,
                                            boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
                                        },
                                    },
                                }}
                            >
                                <Box sx={{ height: 3, bgcolor: DASH.cyan }} />
                                <Box sx={{ p: 2 }}>
                                    <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, mb: 1.2 }}>
                                        Entering a whole class at once
                                    </Typography>

                                    {[
                                        "Press Format to download this class as a spreadsheet.",
                                        "Type a mark under each subject column.",
                                        "Press Import and pick the saved file.",
                                    ].map((step, i) => (
                                        <Box key={step} sx={{ display: "flex", gap: 1.2, mb: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 18,
                                                    height: 18,
                                                    flexShrink: 0,
                                                    borderRadius: "50%",
                                                    bgcolor: DASH.cyanLight,
                                                    color: DASH.cyan,
                                                    fontSize: "10.5px",
                                                    fontWeight: 700,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {i + 1}
                                            </Box>
                                            <Typography sx={{ fontSize: "12px", color: DASH.text, lineHeight: 1.5 }}>
                                                {step}
                                            </Typography>
                                        </Box>
                                    ))}

                                    <Box sx={{ mt: 1.4, pt: 1.4, borderTop: `1px solid ${DASH.lineSoft}` }}>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, lineHeight: 1.6 }}>
                                            Rows are matched by roll number, so do not edit that column.
                                            Leave a cell blank to skip it, or type
                                            <Box component="span" sx={{ fontWeight: 700, color: DASH.text }}> AB</Box> for absent.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Popover>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 4,
                                lg: 2
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    color: DASH.muted,
                                }}
                            >
                                Max mark per subject
                            </Typography>
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
                                    "& .MuiOutlinedInput-root": {
                                        height: 34,
                                        borderRadius: RADIUS,
                                        bgcolor: "#fff",
                                        "& fieldset": { borderColor: DASH.line },
                                        "&:hover fieldset": { borderColor: DASH.faint },
                                        "&.Mui-focused fieldset": { borderColor: websiteSettings.mainColor || DASH.primary, borderWidth: "1px" },
                                    },
                                    "& .MuiInputBase-input": {
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: DASH.ink,
                                        padding: "0 10px",
                                        textAlign: "center",
                                    },
                                }}
                            />
                        </Grid>

                    </Grid>
                    <Grid container>
                        <Grid size={12}>
                            {/* The class tab sits on the table's top edge - its bottom
                               border is dropped so the two read as one surface. */}
                            <Box sx={{ display: "flex" }}>
                                <Typography
                                    sx={{
                                        position: "relative",
                                        top: "1px",
                                        zIndex: 1,
                                        fontSize: "11.5px",
                                        fontWeight: 700,
                                        color: "#fff",
                                        bgcolor: DASH.blue,
                                        border: `1px solid ${DASH.blue}`,
                                        borderBottom: "none",
                                        px: 1.2,
                                        py: 0.3,
                                        borderRadius: "5px 5px 0 0",
                                    }}
                                >
                                    {getData.gradeSection}
                                </Typography>
                            </Box>

                            <TableContainer
                                ref={scrollContainerRef1}
                                sx={{
                                    border: `1px solid ${DASH.line}`,
                                    borderRadius: RADIUS,
                                    borderTopLeftRadius: 0,
                                    bgcolor: "#fff",
                                    maxWidth: "100%",
                                    maxHeight: "72vh",
                                    // Hold the full height while loading so the buttons
                                    // below do not jump once the rows arrive.
                                    height: isTableLoading ? "62vh" : "auto",
                                    overflowY: "auto",
                                    overflowX: "auto",
                                    width: "100%",
                                }}
                                onScroll={(e) => handleVerticalScroll(e, scrollContainerRef1)}
                            >
                                <Table
                                    sx={{
                                        tableLayout: "fixed",
                                        "& thead .MuiTableCell-root": {
                                            color: DASH.muted,
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                            letterSpacing: "0.06em",
                                            textTransform: "uppercase",
                                            py: 1,
                                        },
                                        "& tbody .MuiTableCell-root": {
                                            fontSize: "12.5px",
                                            color: DASH.text,
                                            py: 0.9,
                                        },
                                        "& tbody .MuiTableRow-root:hover .MuiTableCell-root": {
                                            backgroundColor: DASH.surface,
                                        },
                                    }}
                                    stickyHeader={!isMobile}
                                    aria-label="attendance and marks table"
                                >
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
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
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
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
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
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
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
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Class
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Section
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Student Picture
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
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
                                                        borderColor: DASH.line,
                                                        textAlign: "center",
                                                        backgroundColor: DASH.surface,
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
                                                        borderColor: DASH.line,
                                                        textAlign: "center",
                                                        backgroundColor: DASH.surface,
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
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    whiteSpace: "nowrap",
                                                    width: "100px",
                                                }}
                                            >
                                                Scored Marks
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    width: "100px",
                                                }}
                                            >
                                                Percentage
                                            </TableCell>
                                            {/* <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    width: "100px",
                                                }}
                                            >
                                                Remarks
                                            </TableCell> */}
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    width: "100px",
                                                }}
                                            >
                                                Grade
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    width: "100px",
                                                }}
                                            >
                                                Notes
                                            </TableCell>
                                            {/* <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                    backgroundColor: DASH.surface,
                                                    width: "100px",
                                                }}
                                            >
                                                Export
                                            </TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isTableLoading &&
                                            [...Array(10)].map((_, i) => (
                                                <TableRow key={`skeleton-${i}`}>
                                                    <TableCell colSpan={100} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.1 }}>
                                                        <Skeleton variant="rounded" height={18} sx={{ bgcolor: DASH.lineSoft }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                        {!isTableLoading && sortedStudents.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={100} sx={{ borderBottom: "none" }}>
                                                    <Box sx={{ textAlign: "center", py: 5 }}>
                                                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                                                            No students to show
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                                                            Pick a class, section and exam above to load the roster.
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!isTableLoading && sortedStudents.map((row, index) => (
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
                                                        borderColor: DASH.line,
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
                                                        borderColor: DASH.line,
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
                                                        borderColor: DASH.line,
                                                        textAlign: "center",
                                                        backgroundColor: "#fff",
                                                    }}
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: "#fff", }}>
                                                    {row.grade}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: "#fff", }}>
                                                    {row.section}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: "#fff", }}>
                                                    <Button
                                                        sx={{
                                                            textTransform: "none",
                                                            fontSize: "11.5px",
                                                            fontWeight: 700,
                                                            color: DASH.blue,
                                                            borderRadius: RADIUS,
                                                            "&:hover": { bgcolor: DASH.blueLight },
                                                        }}
                                                        onClick={() => handleViewClick(row.profile)}
                                                    >
                                                        <ImageIcon sx={{ color: "#000", marginRight: 1 }} />
                                                        View
                                                    </Button>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: DASH.line,
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
                                                                borderColor: DASH.line,
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
                                                        borderColor: DASH.line,
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
                                                        borderColor: DASH.line,
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
                                                        borderColor: DASH.line,
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
                                                        borderColor: DASH.line,
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
                                                    sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: "#fff" }}
                                                >
                                                    <Button
                                                        onClick={() => handleAdd(row.rollNumber)}
                                                        sx={{
                                                            textTransform: "none",
                                                            fontSize: "11.5px",
                                                            fontWeight: 700,
                                                            height: 26,
                                                            px: 1.2,
                                                            borderRadius: RADIUS,
                                                            color: comments[row.rollNumber] ? DASH.green : DASH.blue,
                                                            "&:hover": { bgcolor: comments[row.rollNumber] ? DASH.greenLight : DASH.blueLight },
                                                        }}
                                                    >
                                                        {comments[row.rollNumber] ? "View" : "Add"}
                                                    </Button>

                                                    <Dialog
                                                        open={openAlert === row.rollNumber}
                                                        onClose={() => setOpenAlert(null)}
                                                        maxWidth="sm"
                                                        fullWidth
                                                        slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
                                                    >
                                                        <Box sx={{ height: 3, bgcolor: websiteSettings.mainColor || DASH.primary }} />
                                                        <Box sx={{ px: 2.4, py: 2 }}>
                                                            <Box sx={{ width: '100%' }}>
                                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.6 }}>
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                                                            Add Comment
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                                                            {row.name} · {row.rollNumber}
                                                                        </Typography>
                                                                    </Box>
                                                                    <IconButton size="small" onClick={() => setOpenAlert(null)}>
                                                                        <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                                                                    </IconButton>
                                                                </Box>
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
                                                                        boxSizing: 'border-box',
                                                                        padding: '10px 12px',
                                                                        borderRadius: RADIUS,
                                                                        border: `1px solid ${DASH.line}`,
                                                                        fontSize: '13px',
                                                                        fontFamily: 'inherit',
                                                                        color: DASH.ink,
                                                                        resize: 'none',
                                                                        outline: 'none',
                                                                    }}
                                                                />
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1.8 }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        onClick={() => setOpenAlert(null)}
                                                                        sx={{
                                                                            textTransform: "none",
                                                                            fontSize: "12.5px",
                                                                            fontWeight: 700,
                                                                            color: DASH.text,
                                                                            bgcolor: "#fff",
                                                                            borderColor: DASH.line,
                                                                            borderRadius: RADIUS,
                                                                            px: 2,
                                                                            height: 34,
                                                                            "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        variant="contained"
                                                                        disableElevation
                                                                        onClick={() => handleSaveComment()}
                                                                        sx={{
                                                                            textTransform: "none",
                                                                            fontSize: "12.5px",
                                                                            fontWeight: 700,
                                                                            backgroundColor: websiteSettings.mainColor,
                                                                            color: websiteSettings.textColor,
                                                                            borderRadius: RADIUS,
                                                                            px: 2.4,
                                                                            height: 34,
                                                                            boxShadow: "none",
                                                                            "&:hover": { backgroundColor: websiteSettings.mainColor, filter: "brightness(0.92)", boxShadow: "none" },
                                                                        }}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Dialog>
                                                </TableCell>

                                                {/* <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center", backgroundColor: "#fff" }}>
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

                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, mt: 2 }}>
                        {isTableLoading && (
                            <>
                                <Skeleton variant="rounded" width={92} height={34} sx={{ bgcolor: DASH.lineSoft }} />
                                <Skeleton variant="rounded" width={104} height={34} sx={{ bgcolor: DASH.lineSoft }} />
                            </>
                        )}

                        {!isTableLoading && (
                        <>
                        <Button
                            variant="outlined"
                            disabled={isPosted === "Y" || !canCreateMarks}
                            onClick={() => handleSaveMarks('draft')}
                            sx={{
                                textTransform: "none",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                color: DASH.text,
                                bgcolor: "#fff",
                                borderColor: DASH.line,
                                borderRadius: RADIUS,
                                px: 2.4,
                                height: 34,
                                boxShadow: "none",
                                "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                "&.Mui-disabled": { color: DASH.faint, borderColor: DASH.lineSoft },
                            }}
                        >
                            Save
                        </Button>

                        <Button
                            onClick={() => handleSaveMarks('post')}
                            variant="contained"
                            sx={{
                                textTransform: "none",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                backgroundColor: websiteSettings.mainColor,
                                color: websiteSettings.textColor,
                                borderRadius: RADIUS,
                                px: 2.8,
                                height: 34,
                                boxShadow: "none",
                                "&:hover": { backgroundColor: websiteSettings.mainColor, filter: "brightness(0.92)", boxShadow: "none" },
                                "&.Mui-disabled": { backgroundColor: DASH.line, color: DASH.faint },
                            }}
                            disabled={!isFormValid() || !canSubmitMarks}
                        >
                            {isPosted === "N" ? "Publish" : "Update"}
                        </Button>
                        </>
                        )}
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
