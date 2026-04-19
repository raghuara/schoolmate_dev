import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, Checkbox, ListItemText, Radio, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TextareaAutosize,  Popper, ClickAwayListener, AccordionSummary, AccordionDetails, Accordion } from "@mui/material";
import RichTextEditor from "../../TextEditor";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ReactPlayer from "react-player";
import { findingGradeWithSubject, GettingGrades, postConsentForm, postFeedBack, postMessage, postNewFeedback, postNews } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Loader from "../../Loader";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PoorEmoji from '../../../Images/emoji/poor.png';
import AverageEmoji from '../../../Images/emoji/average.png';
import GoodEmoji from '../../../Images/emoji/good.png';
import ExcellentEmoji from '../../../Images/emoji/excellent.png';

export default function CreateFeedBackPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name

    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');

    const [activeTab, setActiveTab] = useState(0);
    const [pasteLinkToggle, setPasteLinkToggle] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pastedLink, setPastedLink] = useState("");
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState('');
    const [fileType, setFileType] = useState('');


    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState("Everyone");

    const [classData, setClassData] = useState([]);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedIds, setSelectedIds] = useState([]);
    const [gradeIds, setGradeIds] = useState([]);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSectionIds, setSelectedSectionIds] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);
    const [formattedSectionData, setFormattedSectionData] = useState("");
    const [filter, setFilter] = useState('Students');
    const ref = useRef();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEveryone, setIsEveryone] = useState(false);
    const [expandedGrade, setExpandedGrade] = useState(null);

    const [feedbackCategory, setFeedbackCategory] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const categoryOptions = ['Management', 'General', 'Subjects'];

    // Collect all unique subjects across every grade's exams (primary + secondary)
    const subjectsList = useMemo(() => {
        const set = new Set();
        (grades || []).forEach((grade) => {
            (grade.exams || []).forEach((exam) => {
                (exam.primarySubjects || []).forEach((s) => s && set.add(s.trim()));
                (exam.secondarySubjects || []).forEach((s) => s && set.add(s.trim()));
            });
        });
        return Array.from(set).sort();
    }, [grades]);

    // Grades filtered by selected subjects (fetched from findingGradeWithSubject)
    const [subjectFilteredGrades, setSubjectFilteredGrades] = useState([]);

    // Fetch grades for the selected subjects whenever they change
    useEffect(() => {
        if (feedbackCategory !== 'Subjects' || selectedSubjects.length === 0) {
            setSubjectFilteredGrades([]);
            setSelectedIds([]);
            return;
        }
        setSelectedIds([]);
        const fetchGradesBySubjects = async () => {
            const payload = {
                subjects: selectedSubjects.map((s) => s.toLowerCase()),
            };
            try {
                const res = await axios.post(findingGradeWithSubject, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = res.data?.data || {};
                const gradeMap = new Map();
                Object.values(data).forEach((gradeArr) => {
                    (gradeArr || []).forEach((g) => {
                        const existing = gradeMap.get(g.gradeId);
                        if (existing) {
                            const unionSections = Array.from(new Set([...(existing.sections || []), ...(g.sections || [])]));
                            gradeMap.set(g.gradeId, { ...existing, sections: unionSections });
                        } else {
                            gradeMap.set(g.gradeId, {
                                id: g.gradeId,
                                sign: g.grade,
                                sections: g.sections || [],
                            });
                        }
                    });
                });
                // Sort by the order of grades from redux (canonical grade order)
                const orderIndex = new Map((grades || []).map((g, i) => [g.id, i]));
                const orderedGrades = Array.from(gradeMap.values()).sort((a, b) => {
                    const ai = orderIndex.has(a.id) ? orderIndex.get(a.id) : Number.MAX_SAFE_INTEGER;
                    const bi = orderIndex.has(b.id) ? orderIndex.get(b.id) : Number.MAX_SAFE_INTEGER;
                    return ai - bi;
                });
                setSubjectFilteredGrades(orderedGrades);
            } catch (err) {
                console.error('Error fetching grades by subjects:', err);
                setSubjectFilteredGrades([]);
            }
        };
        fetchGradesBySubjects();
    }, [feedbackCategory, selectedSubjects]);

    // The effective grades list used for the Class & Sections picker
    const effectiveGrades = (feedbackCategory === 'Subjects' && selectedSubjects.length > 0)
        ? subjectFilteredGrades
        : grades;

    const createEmptyQuestion = () => ({
        id: Date.now(),
        questionText: '',
        questionType: '',
        options: ['', ''],
        required: false,
    });

    const [questions, setQuestions] = useState([createEmptyQuestion()]);
    const [subjectQuestions, setSubjectQuestions] = useState({});
    const [sameForAll, setSameForAll] = useState(false);

    const websiteSettings = useSelector(selectWebsiteSettings);

    const questionOptions = [
        { label: "Ratings", value: "ratings" },
        { label: "Multiple Choice", value: "multiplechoice" },
        { label: "Open-Ended", value: "openended" }
    ];

    const handleHeadingChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const updateQuestion = (qIndex, field, value) => {
        setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, [field]: value } : q));
    };

    const handleQuestionTypeChange = (qIndex, newValue) => {
        setQuestions(prev => prev.map((q, i) =>
            i === qIndex ? { ...q, questionType: newValue ? newValue.value : '', options: ['', ''] } : q
        ));
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex) return q;
            const updated = [...q.options];
            updated[optIndex] = value;
            return { ...q, options: updated };
        }));
    };

    const handleAddOption = (qIndex) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex || q.options.length >= 4) return q;
            return { ...q, options: [...q.options, ''] };
        }));
    };

    const handleRemoveOption = (qIndex, optIndex) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex || q.options.length <= 2) return q;
            const updated = [...q.options];
            updated.splice(optIndex, 1);
            return { ...q, options: updated };
        }));
    };

    const handleAddQuestion = () => {
        if (questions.length >= 20) return;
        setQuestions(prev => [...prev, createEmptyQuestion()]);
    };

    const handleRemoveQuestion = (qIndex) => {
        if (questions.length <= 1) return;
        setQuestions(prev => prev.filter((_, i) => i !== qIndex));
    };

    const handleDuplicateQuestion = (qIndex) => {
        if (questions.length >= 20) return;
        setQuestions(prev => {
            const dup = { ...prev[qIndex], id: Date.now(), options: [...prev[qIndex].options] };
            const updated = [...prev];
            updated.splice(qIndex + 1, 0, dup);
            return updated;
        });
    };

    // Subject-specific question handlers with sameForAll sync
    const getSubjectQuestions = (subject) => subjectQuestions[subject] || [createEmptyQuestion()];

    const applySubjectUpdate = (subject, updater) => {
        setSubjectQuestions(prev => {
            const qs = updater([...(prev[subject] || [createEmptyQuestion()])]);
            if (qs === null) return prev;
            if (sameForAll) {
                const synced = {};
                selectedSubjects.forEach(sub => { synced[sub] = JSON.parse(JSON.stringify(qs)); });
                return synced;
            }
            return { ...prev, [subject]: qs };
        });
    };

    const updateSubjectQuestion = (subject, qIndex, field, value) => {
        applySubjectUpdate(subject, (qs) => { qs[qIndex] = { ...qs[qIndex], [field]: value }; return qs; });
    };

    const handleSubjectQuestionTypeChange = (subject, qIndex, newValue) => {
        applySubjectUpdate(subject, (qs) => { qs[qIndex] = { ...qs[qIndex], questionType: newValue ? newValue.value : '', options: ['', ''] }; return qs; });
    };

    const handleSubjectOptionChange = (subject, qIndex, optIndex, value) => {
        applySubjectUpdate(subject, (qs) => { const opts = [...qs[qIndex].options]; opts[optIndex] = value; qs[qIndex] = { ...qs[qIndex], options: opts }; return qs; });
    };

    const handleSubjectAddOption = (subject, qIndex) => {
        applySubjectUpdate(subject, (qs) => { if (qs[qIndex].options.length >= 4) return null; qs[qIndex] = { ...qs[qIndex], options: [...qs[qIndex].options, ''] }; return qs; });
    };

    const handleSubjectRemoveOption = (subject, qIndex, optIndex) => {
        applySubjectUpdate(subject, (qs) => { if (qs[qIndex].options.length <= 2) return null; const opts = [...qs[qIndex].options]; opts.splice(optIndex, 1); qs[qIndex] = { ...qs[qIndex], options: opts }; return qs; });
    };

    const handleSubjectAddQuestion = (subject) => {
        applySubjectUpdate(subject, (qs) => { if (qs.length >= 20) return null; return [...qs, createEmptyQuestion()]; });
    };

    const handleSubjectRemoveQuestion = (subject, qIndex) => {
        applySubjectUpdate(subject, (qs) => { if (qs.length <= 1) return null; return qs.filter((_, i) => i !== qIndex); });
    };

    const handleSubjectDuplicateQuestion = (subject, qIndex) => {
        applySubjectUpdate(subject, (qs) => { if (qs.length >= 20) return null; const dup = { ...qs[qIndex], id: Date.now(), options: [...qs[qIndex].options] }; qs.splice(qIndex + 1, 0, dup); return qs; });
    };

    const handleSubjectSelect = (event, newValues) => {
        setSelectedSubjects(newValues);
        if (sameForAll && newValues.length > 0) {
            setSubjectQuestions(prev => {
                const firstSubjectQs = prev[newValues[0]] || [createEmptyQuestion()];
                const updated = {};
                newValues.forEach(sub => {
                    updated[sub] = JSON.parse(JSON.stringify(firstSubjectQs));
                });
                return updated;
            });
        } else {
            setSubjectQuestions(prev => {
                const updated = { ...prev };
                newValues.forEach(sub => {
                    if (!updated[sub]) updated[sub] = [createEmptyQuestion()];
                });
                return updated;
            });
        }
    };

    const handleSameForAllToggle = (checked) => {
        setSameForAll(checked);
        if (checked && selectedSubjects.length > 0) {
            const firstQs = subjectQuestions[selectedSubjects[0]] || [createEmptyQuestion()];
            const synced = {};
            selectedSubjects.forEach(sub => {
                synced[sub] = JSON.parse(JSON.stringify(firstQs));
            });
            setSubjectQuestions(synced);
        }
    };


    const handleCancelClick = () => {
        setOpenAlert(true);
    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);
        if (confirmed) {
            navigate('/dashboardmenu/feedback');
        }
    };

    const toggleDropdown = (event) => {
        setAnchorEl(anchorEl ? null : ref.current);
    };

    const handleClickAway = () => {
        setAnchorEl(null);
    };

    const isGradeSelected = (grade) => {
        return grade.sections.every(section => selectedIds.includes(`${grade.id}-${section}`));
    };

    const handleGradeToggle = (grade) => {
        const allSectionIds = grade.sections.map(section => `${grade.id}-${section}`);
        const isSelected = isGradeSelected(grade);
        const updated = isSelected
            ? selectedIds.filter(id => !allSectionIds.includes(id))
            : [...selectedIds, ...allSectionIds];
        setSelectedIds(updated);
    };

    const handleSectionToggle = (gradeId, section) => {
        const sectionId = `${gradeId}-${section}`;
        setSelectedIds(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleSelectAll = () => {
        const allSectionIds = effectiveGrades.flatMap(grade =>
            grade.sections.map(section => `${grade.id}-${section}`)
        );
        const allSelected = allSectionIds.length > 0 && selectedIds.length === allSectionIds.length;
        setSelectedIds(allSelected ? [] : allSectionIds);
    };

    const isEveryoneChecked = () => {
        const allIds = effectiveGrades.flatMap(grade =>
            grade.sections.map(section => `${grade.id}-${section}`)
        );
        return allIds.length > 0 && selectedIds.length === allIds.length;
    };

    const isEveryoneIndeterminate = () => {
        const allIds = effectiveGrades.flatMap(grade =>
            grade.sections.map(section => `${grade.id}-${section}`)
        );
        return selectedIds.length > 0 && selectedIds.length < allIds.length;
    };

    const renderValue = () => {
        const selectedData = effectiveGrades
            .map((grade) => {
                const selSections = grade.sections.filter((section) =>
                    selectedIds.includes(`${grade.id}-${section}`)
                );
                if (selSections.length > 0) {
                    return `${grade.sign} (${selSections.join(", ")})`;
                }
                return null;
            })
            .filter(Boolean);
        return selectedData.length > 0 ? selectedData.join(", ") : "Choose Class and Sections";
    };

    const getGradeSectionsPayload = () => {
        const gradeMap = new Map();

        selectedIds.forEach(id => {
            const [gradeIdStr, section] = id.split("-");
            const gradeId = parseInt(gradeIdStr);

            if (!gradeMap.has(gradeId)) {
                gradeMap.set(gradeId, []);
            }

            gradeMap.get(gradeId).push(section);
        });

        const gradeSections = Array.from(gradeMap.entries()).map(([gradeId, sections]) => ({
            gradeId,
            sections
        }));

        return { gradeSections };
    };

    const { gradeSections } = getGradeSectionsPayload();

    useEffect(() => {
        if (!uploadedFiles && !pastedLink.trim()) {
            setFileType("");
        }
    }, [uploadedFiles, pastedLink]);

    useEffect(() => {
        fetchClass()
    }, []);

    const fetchClass = async () => {
        try {
            const res = await axios.get(GettingGrades, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setClassData(res.data)
            console.log("class:", res.data);
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const validateQuestions = (qs, label) => {
        for (let i = 0; i < qs.length; i++) {
            const q = qs[i];
            if (!q.questionType) {
                setMessage(`${label} - Question ${i + 1}: Please select a question type`);
                setOpen(true); setColor(false); setStatus(false);
                return false;
            }
            if (!q.questionText.trim()) {
                setMessage(`${label} - Question ${i + 1}: Question text is required`);
                setOpen(true); setColor(false); setStatus(false);
                return false;
            }
            if (q.questionType === "multiplechoice") {
                if (!q.options[0]?.trim() || !q.options[1]?.trim()) {
                    setMessage(`${label} - Question ${i + 1}: At least 2 options are required`);
                    setOpen(true); setColor(false); setStatus(false);
                    return false;
                }
            }
        }
        return true;
    };

    // Build question objects in the new backend format
    const buildQuestions = (qs) =>
        qs.map((q) => {
            const base = {
                question: q.questionText,
                feedBackType: q.questionType || "ratings",
                required: q.required ? "Y" : "N",
            };
            if (q.questionType === "multiplechoice") {
                q.options.forEach((opt, i) => {
                    if (opt && opt.trim() !== '') {
                        base[`option0${i + 1}`] = opt;
                    }
                });
            }
            return base;
        });

    const handleInsertNewsData = async (status) => {
        if (!feedbackCategory) {
            setMessage("Please select a feedback category");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }
        if (selectedIds.length === 0) {
            setMessage("Please select class & sections");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }
        if (!heading.trim()) {
            setMessage("Feedback Title is required");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        if (feedbackCategory === "Subjects") {
            if (selectedSubjects.length === 0) {
                setMessage("Please select at least one subject");
                setOpen(true); setColor(false); setStatus(false);
                return;
            }
            for (const sub of selectedSubjects) {
                const qs = getSubjectQuestions(sub);
                if (!validateQuestions(qs, sub)) return;
            }
        } else {
            if (!validateQuestions(questions, feedbackCategory)) return;
        }

        setIsLoading(true);
        try {
            const postedOn = dayjs().format('DD-MM-YYYY HH:mm');

            // Base payload common to all categories
            const sendData = {
                category: feedbackCategory === "Subjects" ? "Subject" : feedbackCategory,
                title: heading,
                postedOn,
                createdByRollNumber: rollNumber,
                createdByUserType: userType,
            };

            if (feedbackCategory === "Subjects") {
                // For Subjects: nest gradeSections + questions inside each subject
                sendData.subjects = selectedSubjects.map((sub) => ({
                    subject: sub,
                    gradeSections,
                    questions: buildQuestions(getSubjectQuestions(sub)),
                }));
            } else {
                // For Management / General: flat gradeSections + questions
                sendData.gradeSections = gradeSections;
                sendData.questions = buildQuestions(questions);
            }

            await axios.post(postNewFeedback, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setOpen(true); setColor(true); setStatus(true);
            setMessage("Feedback published successfully");
            setSelectedIds([]);
            setHeading("");
            setFeedbackCategory('');
            setSelectedSubjects([]);
            setSubjectQuestions({});
            setQuestions([createEmptyQuestion()]);
        } catch (error) {
            console.error("Error while inserting data:", error);
            setMessage(error.response?.data?.message || error.message || 'Failed to publish feedback');
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };
    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    // Consistent input styles
    const fieldSx = {
        backgroundColor: "#fff",
        '& .MuiOutlinedInput-root': {
            fontSize: "13px", borderRadius: "6px",
            '& fieldset': { borderColor: '#E0E0E0' },
            '&:hover fieldset': { borderColor: '#bbb' },
            '&.Mui-focused fieldset': { borderColor: websiteSettings.mainColor },
        },
    };
    const labelSx = { fontSize: "12px", fontWeight: 600, color: "#555", mb: 0.5 };

    // Google Forms-style question renderer — clean, one-by-one layout
    const renderQuestionCard = (q, qIndex, opts) => {
        const { onUpdate, onTypeChange, onOptionChange, onAddOption, onRemoveOption, onDuplicate, onRemove, totalQuestions } = opts;
        const typeMeta = questionOptions.find((t) => t.value === q.questionType);

        return (
            <Box
                key={q.id}
                sx={{
                    position: 'relative',
                    backgroundColor: '#fff',
                    border: '1px solid #D1D5DB',
                    borderRadius: '10px',
                    p: 2.5,
                    mb: 1.8, 
                    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                    '&:hover': {
                        borderColor: '#9CA3AF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                    },
                }}
            >
                {/* Top row: Q number + question text + actions */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {/* Number badge */}
                    <Box sx={{
                        minWidth: 28, height: 28, borderRadius: '8px',
                        backgroundColor: `${websiteSettings.mainColor}12`,
                        color: websiteSettings.mainColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, mt: 0.3,
                    }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>{qIndex + 1}</Typography>
                    </Box>

                    {/* Question text input */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TextField
                            fullWidth
                            variant="standard"
                            multiline
                            minRows={1}
                            maxRows={3}
                            placeholder="Type your question..."
                            value={q.questionText}
                            onChange={(e) => onUpdate(qIndex, 'questionText', e.target.value)}
                            slotProps={{
                                input: {   
                                    disableUnderline: false,
                                    sx: {
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        color: '#1F2937',
                                        '&::before': { borderBottomColor: '#E5E7EB' },
                                        '&:hover::before': { borderBottomColor: '#9CA3AF !important' },
                                        '&::after': { borderBottomColor: '#111827' },
                                    },
                                },
                            }}
                        />
                        {/* Helper row under input */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.8, flexWrap: 'wrap' }}>
                            {/* Compact type selector as a chip-like dropdown */}
                            <Autocomplete
                                disablePortal
                                disableClearable
                                options={questionOptions}
                                getOptionLabel={(option) => option.label}
                                value={typeMeta || null}
                                onChange={(e, newValue) => onTypeChange(qIndex, newValue)}
                                sx={{ width: 170 }}
                                PaperComponent={(props) => (
                                    <Paper {...props} style={{ ...props.style, backgroundColor: '#000', color: '#fff' }} />
                                )}
                                slotProps={{
                                    listbox: {
                                        sx: { maxHeight: 200, overflowY: 'auto' },
                                    },
                                }}
                                renderOption={(props, option) => <li {...props} className="classdropdownOptions">{option.label}</li>}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Question Type"
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                sx: {
                                                    height: 30, fontSize: '12px', fontWeight: 600,
                                                    backgroundColor: '#F9FAFB',
                                                    borderRadius: '999px',
                                                    '& fieldset': { border: '1px solid #E5E7EB' },
                                                },
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                padding: '0 8px !important',
                                                '& fieldset': { borderColor: '#E5E7EB' },
                                                '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                '&.Mui-focused fieldset': { borderColor: '#111827' },
                                            },
                                        }}
                                    />
                                )}
                            />

                            {/* Required pill toggle */}
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 0.3,
                                border: '1px solid #E5E7EB', borderRadius: '999px',
                                pl: 1.2, pr: 0.3, height: 30, backgroundColor: '#F9FAFB',
                            }}>
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: q.required ? '#EF4444' : '#6B7280' }}>
                                    Required
                                </Typography>
                                <Switch
                                    size="small"
                                    checked={q.required}
                                    onChange={(e) => onUpdate(qIndex, 'required', e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#EF4444' },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#EF4444' },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Action icons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0 }}>
                        <Tooltip title="Duplicate">
                            <span>
                                <IconButton size="small" onClick={() => onDuplicate(qIndex)} disabled={totalQuestions >= 20}
                                    sx={{ width: 28, height: 28, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {totalQuestions > 1 && (
                            <Tooltip title="Remove">
                                <IconButton size="small" onClick={() => onRemove(qIndex)}
                                    sx={{ width: 28, height: 28, color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}>
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {/* Type-specific preview / inputs */}
                {q.questionType === 'multiplechoice' && (
                    <Box sx={{ mt: 2, ml: 5.3 }}>
                        {q.options.map((opt, optIdx) => (
                            <Box key={optIdx} sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                                <Radio disabled size="small" sx={{ p: 0.3, mr: 0.5, color: '#D1D5DB' }} />
                                <TextField
                                    variant="standard"
                                    fullWidth
                                    value={opt}
                                    onChange={(e) => onOptionChange(qIndex, optIdx, e.target.value)}
                                    placeholder={`Option ${optIdx + 1}`}
                                    inputProps={{ maxLength: 50 }}
                                    slotProps={{
                                        input: {
                                            sx: {
                                                fontSize: '13px',
                                                '&::before': { borderBottomColor: '#E5E7EB' },
                                                '&:hover::before': { borderBottomColor: '#9CA3AF !important' },
                                                '&::after': { borderBottomColor: '#111827' },
                                            },
                                        },
                                    }}
                                />
                                {q.options.length > 2 && (
                                    <IconButton size="small" onClick={() => onRemoveOption(qIndex, optIdx)}
                                        sx={{ ml: 0.3, color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}>
                                        <CloseIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                        {q.options.length < 4 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.3, mt: 0.5 }}>
                                <Radio disabled size="small" sx={{ p: 0.3, mr: 0.5, color: '#D1D5DB' }} />
                                <Button
                                    size="small"
                                    onClick={() => onAddOption(qIndex)}
                                    sx={{
                                        textTransform: 'none', fontSize: '12px', fontWeight: 500,
                                        color: '#6B7280', p: 0, minWidth: 'auto',
                                        '&:hover': { bgcolor: 'transparent', color: websiteSettings.mainColor },
                                    }}>
                                    Add option
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                {q.questionType === 'ratings' && (
                    <Box sx={{ mt: 2, ml: 5.3, display: 'flex', gap: 2, alignItems: 'center' }}>
                        {[PoorEmoji, AverageEmoji, GoodEmoji, ExcellentEmoji].map((emoji, i) => (
                            <Box key={i} sx={{ textAlign: 'center', opacity: 0.6 }}>
                                <img src={emoji} alt="" width={22} />
                                <Typography sx={{ fontSize: '9px', color: '#9CA3AF', mt: 0.2 }}>
                                    {['Poor', 'Average', 'Good', 'Excellent'][i]}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {q.questionType === 'openended' && (
                    <Box sx={{ mt: 2, ml: 5.3 }}>
                        <Typography sx={{
                            fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic',
                            borderBottom: '1px dashed #E5E7EB', pb: 0.5,
                        }}>
                            Long-text answer
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Fixed Header */}
            <Box sx={{
                position: "fixed", zIndex: 100, backgroundColor: "#f2f2f2",
                borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center",
                width: "100%", py: 1.2, px: 2, marginTop: "-2px",
            }}>
                <Link style={{ textDecoration: "none" }} to="/dashboardmenu/feedback">
                    <IconButton sx={{ width: 28, height: 28 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                </Link>
                <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#1F2937", ml: 0.5 }}>Create Feedback</Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ pt: 7, px: 2.5, pb: 3, height: "calc(100vh - 80px)", overflowY: "auto" }}>

                {/* Top Controls Card */}
                <Paper elevation={0} sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    mb: 2.5,
                }}>
                    {/* Mini section header */}
                    <Box sx={{
                        px: 2.5, py: 1.2,
                        borderBottom: "1px solid #F0F0F0",
                        backgroundColor: "#FAFAFA",
                        display: "flex", alignItems: "center", gap: 1,
                    }}>
                        <Box sx={{
                            width: 4, height: 14,
                            backgroundColor: websiteSettings.mainColor,
                            borderRadius: "2px",
                        }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            Feedback Details
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        {/* Category */}
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: feedbackCategory === "Subjects" ? 2.5 : 3  }}>
                            <Typography sx={labelSx}>Category</Typography>
                            <Autocomplete
                                disablePortal
                                options={categoryOptions}
                                value={feedbackCategory || null}
                                onChange={(e, val) => { setFeedbackCategory(val || ''); setSelectedSubjects([]); setSubjectQuestions({}); }}
                                PaperComponent={(props) => <Paper {...props} style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff" }} />}
                                renderOption={(props, option) => <li {...props} className="classdropdownOptions">{option}</li>}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Select Category" fullWidth
                                        slotProps={{ input: { ...params.InputProps, sx: { height: "38px", fontSize: "13px", fontWeight: 500, backgroundColor: "#fff" } } }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Subject selector */}
                        {feedbackCategory === "Subjects" && (
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
                                <Typography sx={labelSx}>Subjects</Typography>
                                <Autocomplete
                                    multiple limitTags={2} disableCloseOnSelect
                                    options={subjectsList} value={selectedSubjects} onChange={handleSubjectSelect}
                                    PaperComponent={(props) => (
                                        <Paper {...props} style={{ ...props.style, backgroundColor: "#000", color: "#fff" }} />
                                    )}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props} className="classdropdownOptions">
                                            <Checkbox size="small" checked={selected} sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" }, mr: 1, p: 0.3 }} />
                                            {option}
                                        </li>
                                    )}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: "38px", flexWrap: "nowrap", overflow: "hidden",
                                            fontSize: "13px", fontWeight: 500, backgroundColor: "#fff",
                                            py: "0px !important",
                                        },
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder={selectedSubjects.length === 0 ? "Select Subjects" : ""} fullWidth />
                                    )}
                                    slotProps={{
                                        chip: { size: "small", sx: { height: "20px", fontSize: "11px", fontWeight: 600, my: 0 } },
                                        listbox: {
                                            sx: {
                                                maxHeight: 220,
                                                overflowY: 'auto',
                                                '&::-webkit-scrollbar': { width: 6 },
                                                '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: 3 },
                                                '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        )}

                        {/* Class & Section */}
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: feedbackCategory === "Subjects" ? 2.5 : 3 }}>
                            <Typography sx={labelSx}>Class & Sections</Typography>
                            <Button variant="outlined" ref={ref} onClick={toggleDropdown}
                                sx={{
                                    width: "100%", justifyContent: "flex-start", textTransform: "none",
                                    overflow: "hidden", color: "#374151", border: "1px solid #E0E0E0",
                                    height: "38px", backgroundColor: "#fff", fontSize: "13px", fontWeight: 500,
                                    borderRadius: "6px",
                                    "&:hover": { borderColor: "#bbb", backgroundColor: "#fff" },
                                }}
                            >
                                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", textAlign: "left" }}>
                                    {renderValue()}
                                </Box>
                            </Button>
                            <Popper open={Boolean(anchorEl)} anchorEl={ref.current} placement="bottom-start" style={{ zIndex: 1300, width: ref.current?.offsetWidth, marginTop: 4 }}>
                                <ClickAwayListener onClickAway={handleClickAway}>
                                    <Paper sx={{
                                        maxHeight: 360, overflowY: 'auto', overflowX: 'hidden',
                                        bgcolor: '#0F172A', color: '#fff',
                                        borderRadius: '3px', border: '1px solid #1E293B',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                        '&::-webkit-scrollbar': { width: 6 },
                                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#334155', borderRadius: 3 },
                                        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                                    }}>
                                        {/* Everyone row */}
                                        <Box
                                            onClick={handleSelectAll}
                                            sx={{
                                                display: 'flex', alignItems: 'center',
                                                px: 1.5, py: 1,
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #1E293B',
                                                transition: 'background-color 0.15s',
                                                '&:hover': { bgcolor: '#1E293B' },
                                            }}
                                        >
                                            <Checkbox
                                                size="small"
                                                checked={isEveryoneChecked()}
                                                indeterminate={isEveryoneIndeterminate()}
                                                sx={{
                                                    p: 0, mr: 1.2,
                                                    color: '#94A3B8',
                                                    '&.Mui-checked': { color: '#fff' },
                                                    '&.MuiCheckbox-indeterminate': { color: '#fff' },
                                                }}
                                            />
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                Everyone
                                            </Typography>
                                            <Typography sx={{ ml: 'auto', fontSize: '10px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                Select All
                                            </Typography>
                                        </Box>

                                        {/* Grades list */}
                                        {effectiveGrades.length === 0 ? (
                                            <Box sx={{ px: 1.5, py: 3, textAlign: 'center' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                                    {feedbackCategory === 'Subjects' && selectedSubjects.length === 0
                                                        ? 'Select subjects first'
                                                        : 'No classes available'}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            effectiveGrades.map((grade, gIdx) => {
                                                const isOpen = expandedGrade === grade.id;
                                                const isAll = isGradeSelected(grade);
                                                const isPartial = grade.sections.some((s) => selectedIds.includes(`${grade.id}-${s}`)) && !isAll;
                                                return (
                                                    <Box
                                                        key={grade.id}
                                                        sx={{ borderBottom: gIdx === effectiveGrades.length - 1 ? 'none' : '1px solid #1E293B' }}
                                                    >
                                                        {/* Grade row */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex', alignItems: 'center',
                                                                px: 1.5, py: 0.8,
                                                                transition: 'background-color 0.15s',
                                                                '&:hover': { bgcolor: '#1E293B' },
                                                            }}
                                                        >
                                                            <Box
                                                                onClick={(e) => { e.stopPropagation(); handleGradeToggle(grade); }}
                                                                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1, minWidth: 0 }}
                                                            >
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={isAll}
                                                                    indeterminate={isPartial}
                                                                    sx={{
                                                                        p: 0, mr: 1.2,
                                                                        color: '#94A3B8',
                                                                        '&.Mui-checked': { color: '#fff' },
                                                                        '&.MuiCheckbox-indeterminate': { color: '#fff' },
                                                                    }}
                                                                />
                                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                                                                    {grade.sign}
                                                                </Typography>
                                                                {isAll && (
                                                                    <Typography sx={{ ml: 1, fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                                                                        All sections
                                                                    </Typography>
                                                                )}
                                                                {isPartial && (
                                                                    <Typography sx={{ ml: 1, fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                                                                        {grade.sections.filter((s) => selectedIds.includes(`${grade.id}-${s}`)).length}/{grade.sections.length}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedGrade(isOpen ? null : grade.id);
                                                                }}
                                                                sx={{
                                                                    p: 0.3,
                                                                    color: '#94A3B8',
                                                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    transition: 'transform 0.2s',
                                                                    '&:hover': { color: '#fff', bgcolor: 'transparent' },
                                                                }}
                                                            >
                                                                <ExpandMoreIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Box>

                                                        {/* Sections (expanded) */}
                                                        {isOpen && (
                                                            <Box sx={{ bgcolor: '#020617', pb: 0.5 }}>
                                                                {grade.sections.map((section) => {
                                                                    const checked = selectedIds.includes(`${grade.id}-${section}`);
                                                                    return (
                                                                        <Box
                                                                            key={section}
                                                                            onClick={() => handleSectionToggle(grade.id, section)}
                                                                            sx={{
                                                                                display: 'flex', alignItems: 'center',
                                                                                pl: 4, pr: 1.5, py: 0.6,
                                                                                cursor: 'pointer',
                                                                                transition: 'background-color 0.15s',
                                                                                '&:hover': { bgcolor: '#1E293B' },
                                                                            }}
                                                                        >
                                                                            <Checkbox
                                                                                size="small"
                                                                                checked={checked}
                                                                                sx={{
                                                                                    p: 0, mr: 1.2,
                                                                                    color: '#64748B',
                                                                                    '&.Mui-checked': { color: '#fff' },
                                                                                }}
                                                                            />
                                                                            <Typography sx={{ fontSize: '12px', color: checked ? '#fff' : '#CBD5E1', fontWeight: checked ? 600 : 500 }}>
                                                                                {section}
                                                                            </Typography>
                                                                        </Box>
                                                                    );
                                                                })}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                );
                                            })
                                        )}
                                    </Paper>
                                </ClickAwayListener>
                            </Popper>
                        </Grid>

                        {/* Feedback Title */}
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: feedbackCategory === "Subjects" ? 4.5 : 6}}>
                            <Typography sx={labelSx}>Feedback Title</Typography>
                            <Box sx={{ position: "relative" }}>
                                <TextField
                                    size="small" fullWidth value={heading} onChange={handleHeadingChange}
                                    placeholder="Enter feedback title..."
                                    sx={fieldSx}
                                    slotProps={{ input: { sx: { height: "38px", fontSize: "13px", fontWeight: 500 } } }}
                                />
                                <Typography sx={{ fontSize: "10px", color: "#9CA3AF", position: "absolute", right: 0, top: "100%", mt: 0.3 }}>{heading.length}/100</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    </Box>
                </Paper>

                {/* Empty State */}
                {!feedbackCategory && (
                    <Box sx={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        height: "45vh", color: "#D1D5DB", border: "2px dashed #E5E7EB", borderRadius: "12px", backgroundColor: "#FAFAFA",
                    }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#9CA3AF" }}>Select a category to get started</Typography>
                        <Typography sx={{ fontSize: "12px", mt: 0.5, color: "#D1D5DB" }}>Choose Management, General, or Subjects above</Typography>
                    </Box>
                )}

                {/* Management / General */}
                {(feedbackCategory === "Management" || feedbackCategory === "General") && (
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", p: 2.5 }}>
                        {questions.map((q, qIndex) => renderQuestionCard(q, qIndex, {
                            onUpdate: updateQuestion, onTypeChange: handleQuestionTypeChange,
                            onOptionChange: handleOptionChange, onAddOption: handleAddOption,
                            onRemoveOption: handleRemoveOption, onDuplicate: handleDuplicateQuestion,
                            onRemove: handleRemoveQuestion, totalQuestions: questions.length,
                        }))}
                        {questions.length < 20 && (
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddQuestion} fullWidth
                                sx={{
                                    textTransform: "none", borderStyle: "dashed", borderColor: "#D1D5DB", color: "#6B7280",
                                    borderRadius: "10px", py: 1.2, fontSize: "13px", fontWeight: 600,
                                    "&:hover": { borderColor: websiteSettings.mainColor, color: websiteSettings.mainColor, backgroundColor: `${websiteSettings.mainColor}08` },
                                }}>
                                Add Question ({questions.length}/20)
                            </Button>
                        )}
                    </Box>
                )}

                {/* Subjects */}
                {feedbackCategory === "Subjects" && selectedSubjects.length > 0 && (
                    <>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>
                            {sameForAll
                                ? "Changes apply to all selected subjects"
                                : "Edit each subject independently"}
                        </Typography>
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 0.5,
                            border: "1px solid #E5E7EB", borderRadius: "999px", pl: 1.5, pr: 0.5, py: 0.2,
                            backgroundColor: "#fff",
                        }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Same Questions for All</Typography>
                            <Switch size="small" checked={sameForAll}
                                onChange={(e) => handleSameForAllToggle(e.target.checked)}
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": { color: websiteSettings.mainColor },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: websiteSettings.mainColor },
                                }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{
                        display: "flex", gap: 2, overflowX: "auto", pb: 1,
                        "&::-webkit-scrollbar": { height: 6 },
                        "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "#D1D5DB" },
                    }}>
                        {selectedSubjects.map((subject) => {
                            const qs = getSubjectQuestions(subject);
                            return (
                                <Box key={subject} sx={{
                                    minWidth: selectedSubjects.length === 1 ? "100%" : selectedSubjects.length === 2 ? "49%" : "440px",
                                    maxWidth: selectedSubjects.length === 1 ? "100%" : selectedSubjects.length === 2 ? "49%" : "440px",
                                    border: "1px solid #E5E7EB", borderRadius: "10px", backgroundColor: "#fff",
                                    display: "flex", flexDirection: "column", flexShrink: 0,
                                }}>
                                    <Box sx={{
                                        px: 2, py: 1.2, borderBottom: "1px solid #E5E7EB",
                                        backgroundColor: `${websiteSettings.mainColor}0A`, borderRadius: "10px 10px 0 0",
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                    }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1F2937" }}>
                                            {subject}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>
                                            {qs.length}/20
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 2, maxHeight: "58vh", overflowY: "auto", flex: 1 }}>
                                        {qs.map((q, qIndex) => renderQuestionCard(q, qIndex, {
                                            onUpdate: (idx, field, val) => updateSubjectQuestion(subject, idx, field, val),
                                            onTypeChange: (idx, val) => handleSubjectQuestionTypeChange(subject, idx, val),
                                            onOptionChange: (idx, optIdx, val) => handleSubjectOptionChange(subject, idx, optIdx, val),
                                            onAddOption: (idx) => handleSubjectAddOption(subject, idx),
                                            onRemoveOption: (idx, optIdx) => handleSubjectRemoveOption(subject, idx, optIdx),
                                            onDuplicate: (idx) => handleSubjectDuplicateQuestion(subject, idx),
                                            onRemove: (idx) => handleSubjectRemoveQuestion(subject, idx),
                                            totalQuestions: qs.length,
                                        }))}
                                        {qs.length < 20 && (
                                            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleSubjectAddQuestion(subject)} fullWidth
                                                sx={{
                                                    textTransform: "none", borderStyle: "dashed", borderColor: "#D1D5DB", color: "#6B7280",
                                                    borderRadius: "10px", py: 1, fontSize: "12px", fontWeight: 600,
                                                    "&:hover": { borderColor: websiteSettings.mainColor, color: websiteSettings.mainColor, backgroundColor: `${websiteSettings.mainColor}08` },
                                                }}>
                                                Add Question ({qs.length}/20)
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                    </>
                )}

                {feedbackCategory === "Subjects" && selectedSubjects.length === 0 && (
                    <Box sx={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        height: "40vh", color: "#D1D5DB", border: "2px dashed #E5E7EB", borderRadius: "12px", backgroundColor: "#FAFAFA",
                    }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#9CA3AF" }}>Select subjects to create feedback</Typography>
                    </Box>
                )}

                {/* Action Buttons */}
                {feedbackCategory && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3, pb: 1 }}>
                        <Button onClick={handleCancelClick}
                            sx={{
                                textTransform: 'none', borderRadius: '30px', fontSize: '13px',
                                py: 0.6, px: 3.5, border: '1px solid #D1D5DB', color: '#374151', fontWeight: 600,
                                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
                            }}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleInsertNewsData('post')}
                            sx={{
                                textTransform: 'none', backgroundColor: websiteSettings.mainColor,
                                borderRadius: '30px', fontSize: '13px', py: 0.6, px: 3.5,
                                color: websiteSettings.textColor, fontWeight: 600, boxShadow: "none",
                                "&:hover": { backgroundColor: websiteSettings.mainColor, opacity: 0.9 },
                            }}>
                            Publish
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={openAlert} onClose={() => setOpenAlert(false)} PaperProps={{ sx: { borderRadius: "12px", overflow: "hidden" } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: "16px", color: '#fff', backgroundColor: '#1F2937', py: 2 }}>
                    Are you sure?
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', color: '#fff', backgroundColor: '#1F2937', pb: 1 }}>
                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>Do you really want to cancel? Your changes might not be saved.</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#1F2937', pb: 2.5, gap: 1 }}>
                    <Button onClick={() => handleCloseDialog(false)}
                        sx={{ textTransform: 'none', width: 80, borderRadius: '30px', fontSize: '13px', py: 0.4, border: '1px solid #6B7280', color: '#D1D5DB', fontWeight: 600 }}>
                        No
                    </Button>
                    <Button onClick={() => handleCloseDialog(true)}
                        sx={{ textTransform: 'none', backgroundColor: websiteSettings.mainColor, width: 80, borderRadius: '30px', fontSize: '13px', py: 0.4, color: websiteSettings.textColor, fontWeight: 600 }}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
