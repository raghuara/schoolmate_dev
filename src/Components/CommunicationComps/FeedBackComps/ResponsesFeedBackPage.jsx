import { Autocomplete, Box, Button, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, LinearProgress, Menu, MenuItem, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { deleteNewFeedbackByTitleId, fetchNewFeedbackAdminResponses } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ImageIcon from '@mui/icons-material/Image';
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { selectSidebarExpanded } from "../../../Redux/Slices/sidebarSlice";
import PoorEmoji from '../../../Images/emoji/poor.png';
import AverageEmoji from '../../../Images/emoji/average.png';
import GoodEmoji from '../../../Images/emoji/good.png';
import ExcellentEmoji from '../../../Images/emoji/excellent.png';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import * as XLSX from 'xlsx';

const emojis = [PoorEmoji, AverageEmoji, GoodEmoji, ExcellentEmoji];
const emojiLabels = ['Poor', 'Average', 'Good', 'Excellent'];

const CATEGORY_COLORS = {
    Management: { color: '#6366F1', bg: '#EEF2FF' },
    General: { color: '#0891B2', bg: '#ECFEFF' },
    Subject: { color: '#D97706', bg: '#FFFBEB' },
};

const TYPE_LABELS = {
    ratings: 'Ratings',
    multiplechoice: 'Multiple Choice',
    openended: 'Open-Ended',
};

// Build a normalized question list from the feedback item
const normalizeQuestions = (questions = []) =>
    (questions || []).map((q, i) => ({
        questionId: q.questionId,
        questionNo: i + 1,
        question: q.question,
        feedBackType: q.feedBackType || 'openended',
        required: q.required === 'Y',
        options: [q.option01, q.option02, q.option03, q.option04].filter(Boolean),
    }));

// Build a student row keyed by rollNumber with answers by questionId
const normalizeStudents = (students = []) =>
    (students || []).map((s) => {
        const answers = {};
        (s.answers || []).forEach((a) => {
            answers[a.questionId] = a.answer;
        });
        return {
            rollNumber: s.rollNumber,
            studentName: s.student,
            gradeId: s.gradeId,
            class: s.grade,
            section: s.section,
            profile: s.photo,
            completed: s.completed === 'Y',
            answers,
        };
    });

// Render one response cell based on question type
const ResponseCell = ({ type, value }) => {
    if (value === undefined || value === null || value === '') {
        return <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>;
    }
    if (type === 'ratings') {
        const idx = parseInt(value) - 1;
        if (idx >= 0 && idx < 4) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <img src={emojis[idx]} alt={emojiLabels[idx]} width={20} />
                    <Typography sx={{ fontSize: '10px', color: '#555', fontWeight: 600 }}>{emojiLabels[idx]}</Typography>
                </Box>
            );
        }
        return <Typography sx={{ fontSize: '12px', color: '#999' }}>—</Typography>;
    }
    return (
        <Tooltip title={value} arrow>
            <Typography sx={{
                fontSize: '12px', color: '#374151', maxWidth: 180,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mx: 'auto',
            }}>
                {value}
            </Typography>
        </Tooltip>
    );
};

export default function ResponsesFeedBackPage() {
    const location = useLocation();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    const grades = useSelector(selectGrades);
    const isExpanded = useSelector(selectSidebarExpanded);

    const rollNumber = user.rollNumber;
    const userType = user.userType;
    const token = '123';

    const value = location.state?.value || 'N';

    const [isLoading, setIsLoading] = useState(false);
    const [allData, setAllData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const selectedGrade = grades.find((g) => g.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((s) => ({ sectionName: s })) || [];

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);

    const [expanded, setExpanded] = useState({});
    const [activeSubjectTab, setActiveSubjectTab] = useState({});
    const [deleteId, setDeleteId] = useState('');
    const [deleteTitle, setDeleteTitle] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [openAlert, setOpenAlert] = useState(false);

    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const [filterState, setFilterState] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeFilterKey, setActiveFilterKey] = useState(null);

    const [showButton, setShowButton] = useState(false);
    const boxRef = useRef(null);

    const [categoryTab, setCategoryTab] = useState(0);
    const categoryOptions = ['All', 'Management', 'General', 'Subject'];

    const darkTheme = createTheme({
        palette: { mode: 'dark', primary: { main: '#90caf9' }, background: { paper: '#121212' }, text: { primary: '#ffffff' } },
    });

    // Auto-select the first grade and its first section on mount
    useEffect(() => {
        if (grades?.length > 0 && !selectedGradeId) {
            const firstGrade = grades[0];
            setSelectedGradeId(firstGrade.id);
            setSelectedSection(firstGrade.sections?.[0] || null);
        }
    }, [grades]);

    useEffect(() => {
        if (selectedGradeId && selectedSection) fetchData();
    }, [categoryTab, formattedDate, selectedGradeId, selectedSection]);

    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const onScroll = () => setShowButton(el.scrollTop > 100);
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = {
                category: categoryOptions[categoryTab],
                gradeId: selectedGradeId,
                section: selectedSection,
            };
            if (formattedDate) params.date = formattedDate;

            const res = await axios.get(fetchNewFeedbackAdminResponses, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllData(res.data?.data || []);
        } catch (error) {
            console.error(error);
            setAllData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id, title = '') => {
        setDeleteId(id);
        setDeleteTitle(title);
        setDeleteConfirmText('');
        setOpenAlert(true);
    };

    const closeDeleteDialog = () => {
        setOpenAlert(false);
        setDeleteConfirmText('');
    };

    const confirmDelete = async () => {
        if (deleteConfirmText !== 'delete') return;
        setOpenAlert(false);
        setDeleteConfirmText('');
        setIsLoading(true);
        try {
            await axios.delete(deleteNewFeedbackByTitleId, {
                params: { headerId: deleteId },
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            setOpen(true); setColor(true); setStatus(true);
            setMessage('Feedback deleted successfully');
        } catch {
            setOpen(true); setColor(false); setStatus(false);
            setMessage('Failed to delete. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedSection(newValue.sections?.[0] || null);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
        }
        setExpanded({});
    };

    const handleSectionChange = (_e, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
        setExpanded({});
    };

    // Export a single question-set to Excel
    const handleExport = (questions, students, title) => {
        const header = ['S.No', 'Roll Number', 'Student Name', 'Class', 'Section'];
        questions.forEach((q) => header.push(`Q${q.questionNo}: ${q.question}`));
        const data = students.map((s, i) => {
            const row = [i + 1, s.rollNumber, s.studentName, s.class, s.section];
            questions.forEach((q) => {
                const v = s.answers[q.questionId];
                if (q.feedBackType === 'ratings') row.push(emojiLabels[parseInt(v) - 1] || '-');
                else row.push(v || '-');
            });
            return row;
        });
        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, (title || 'Feedback').slice(0, 30));
        XLSX.writeFile(wb, `feedback_${(title || 'export').replace(/\s+/g, '_')}_${dayjs().format('DD-MM-YYYY_HH-mm-ss')}.xlsx`);
    };

    // Rating filter menu
    const handleFilterOpen = (event, key) => { setAnchorEl(event.currentTarget); setActiveFilterKey(key); };
    const handleFilterClose = () => { setAnchorEl(null); setActiveFilterKey(null); };
    const handleFilterSelect = (val) => {
        setFilterState((prev) => ({ ...prev, [activeFilterKey]: val !== '' ? String(val) : '' }));
        handleFilterClose();
    };

    const filteredData = useMemo(() => (
        (allData || []).filter((dg) =>
            (dg.feedbacks || []).some((i) =>
                (i.title || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    ), [allData, searchQuery]);

    const getCategoryColor = (c) => CATEGORY_COLORS[c] || { color: '#6B7280', bg: '#F3F4F6' };

    // Render a multi-question response table
    const renderMultiQuestionTable = (questions, students, feedbackKey) => {
        const currentFilter = filterState[feedbackKey] || '';
        const hasRatings = questions.some((q) => q.feedBackType === 'ratings');
        const filteredStudents = currentFilter
            ? students.filter((s) => Object.values(s.answers).some((v) => String(v) === currentFilter))
            : students;

        if (questions.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 5, color: '#9CA3AF' }}>
                    <Typography sx={{ fontSize: '13px' }}>No questions configured</Typography>
                </Box>
            );
        }

        return (
            <>
                {/* Filter + Export bar */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 1.2 }}>
                    {hasRatings && (
                        <>
                            {currentFilter && (
                                <Chip
                                    label={emojiLabels[parseInt(currentFilter) - 1]}
                                    size="small"
                                    icon={<img src={emojis[parseInt(currentFilter) - 1]} alt="" width={14} />}
                                    onDelete={() => setFilterState((p) => ({ ...p, [feedbackKey]: '' }))}
                                    sx={{ height: 24, fontSize: '11px', fontWeight: 600 }}
                                />
                            )}
                            <Tooltip title="Filter by rating (any question)">
                                <IconButton size="small" onClick={(e) => handleFilterOpen(e, feedbackKey)}
                                    sx={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                                    <FilterAltIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Export to Excel">
                        <Button size="small" onClick={() => handleExport(questions, filteredStudents, feedbackKey)}
                            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                                fontSize: '11px', fontWeight: 600, textTransform: 'none', color: '#374151',
                                border: '1px solid #E5E7EB', borderRadius: '6px', px: 1.5, height: 28,
                                '&:hover': { bgcolor: '#F9FAFB' },
                            }}>
                            Export
                        </Button>
                    </Tooltip>
                </Box>

                <TableContainer sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', maxHeight: '55vh', maxWidth: '100%', overflowX: 'auto', boxShadow: 'none' }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6', textAlign: 'center', py: 1.3, whiteSpace: 'nowrap', minWidth: 40, borderBottom: '1px solid #E5E7EB' }}>S.No</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6', textAlign: 'center', py: 1.3, whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>Roll No</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6', textAlign: 'center', py: 1.3, whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6', textAlign: 'center', py: 1.3, whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>Grade</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6', textAlign: 'center', py: 1.3, whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>Sec</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6', textAlign: 'center', py: 1.3, whiteSpace: 'nowrap', borderBottom: '1px solid #E5E7EB' }}>Photo</TableCell>
                                {questions.map((q, i) => (
                                    <TableCell key={q.questionId || i} sx={{
                                        fontWeight: 700, fontSize: '11px', color: '#374151', bgcolor: '#F3F4F6',
                                        textAlign: 'center', py: 1.3, minWidth: 160,
                                        borderLeft: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
                                    }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: websiteSettings.mainColor || '#E60154' }}>
                                                Q{q.questionNo}
                                                {q.required && <span style={{ color: '#EF4444' }}> *</span>}
                                            </Typography>
                                            <Tooltip title={q.question} arrow>
                                                <Typography sx={{
                                                    fontSize: '11px', color: '#374151', fontWeight: 600,
                                                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mx: 'auto',
                                                }}>
                                                    {q.question || 'Untitled'}
                                                </Typography>
                                            </Tooltip>
                                            <Typography sx={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase' }}>
                                                {TYPE_LABELS[q.feedBackType] || q.feedBackType}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6 + questions.length} sx={{ textAlign: 'center', py: 5, color: '#9CA3AF', fontSize: '13px' }}>
                                        No responses yet
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredStudents.map((s, i) => (
                                <TableRow key={s.rollNumber || i} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                                    <TableCell sx={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', borderColor: '#F0F0F0' }}>{i + 1}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#374151', borderColor: '#F0F0F0' }}>{s.rollNumber}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: '12px', color: '#374151', borderColor: '#F0F0F0' }}>{s.studentName}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', borderColor: '#F0F0F0' }}>{s.class}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', borderColor: '#F0F0F0' }}>{s.section}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', borderColor: '#F0F0F0' }}>
                                        <Button size="small" disabled={!s.profile} onClick={() => { setImageUrl(s.profile); setOpenImage(true); }}
                                            sx={{ fontSize: '11px', textTransform: 'none', color: '#6B7280', minWidth: 'auto', p: 0.3 }}>
                                            <ImageIcon sx={{ fontSize: 16, mr: 0.3 }} /> View
                                        </Button>
                                    </TableCell>
                                    {questions.map((q, qi) => (
                                        <TableCell key={q.questionId || qi} sx={{ textAlign: 'center', borderLeft: '1px solid #F0F0F0', borderColor: '#F0F0F0' }}>
                                            <ResponseCell type={q.feedBackType} value={s.answers[q.questionId]} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    if (userType !== 'superadmin' && userType !== 'admin' && userType !== 'staff') {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    return (
        <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{ backgroundColor: '#f2f2f2', px: 2.5, py: 1.2, borderBottom: '1px solid #E5E7EB', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                <Grid container alignItems="center" spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Link style={{ textDecoration: 'none' }} to="/dashboardmenu/feedback">
                            <IconButton sx={{ width: 28, height: 28 }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#1F2937', ml: 0.5 }}>
                            Responses Received
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3.5 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search Feedback by Title"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#555' }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        padding: '0 10px',
                                        borderRadius: '50px',
                                        height: '33px',
                                        fontSize: '12px',
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    minHeight: '28px',
                                    paddingRight: '3px',
                                    backgroundColor: '#fff',
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 5, lg: 5.5 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.2, flexWrap: 'wrap' }}>
                        <Autocomplete
                            disablePortal
                            options={grades}
                            getOptionLabel={(option) => option.sign}
                            value={grades.find((item) => item.id === selectedGradeId) || null}
                            onChange={(event, newValue) => handleGradeChange(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ width: '150px' }}
                            PaperComponent={(props) => (
                                <Paper
                                    {...props}
                                    style={{
                                        ...props.style,
                                        backgroundColor: '#000',
                                        color: '#fff',
                                    }}
                                />
                            )}
                            slotProps={{
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
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            sx: {
                                                paddingRight: 0,
                                                height: '33px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                        <Autocomplete
                            disablePortal
                            options={sections}
                            getOptionLabel={(option) => option.sectionName}
                            value={sections.find((option) => option.sectionName === selectedSection) || null}
                            onChange={handleSectionChange}
                            isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                            sx={{ width: '150px' }}
                            PaperComponent={(props) => (
                                <Paper
                                    {...props}
                                    style={{
                                        ...props.style,
                                        backgroundColor: '#000',
                                        color: '#fff',
                                    }}
                                />
                            )}
                            slotProps={{
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
                            renderOption={(props, option) => (
                                <li {...props} className="classdropdownOptions">
                                    {option.sectionName}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    placeholder="Select Section"
                                    {...params}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            sx: {
                                                paddingRight: 0,
                                                height: '33px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                        <ThemeProvider theme={darkTheme}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker open={openCal} onClose={() => setOpenCal(false)} value={selectedDate}
                                    onChange={(v) => { setSelectedDate(v); setFormattedDate(dayjs(v).format('DD-MM-YYYY')); setOpenCal(false); }}
                                    disableFuture views={['year', 'month', 'day']}
                                    sx={{ opacity: 0, pointerEvents: 'none', width: 0, height: 0, position: 'absolute' }}
                                />
                            </LocalizationProvider>
                        </ThemeProvider>
                        <Tooltip title="Filter by date">
                            <IconButton onClick={() => setOpenCal(true)} sx={{ width: 36, height: 36, border: '1px solid #E0E0E0', borderRadius: '8px', backgroundColor: '#fff' }}>
                                <CalendarMonthIcon sx={{ fontSize: 18, color: '#374151' }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Box>

            {/* Content */}
            <Box ref={boxRef} sx={{
                height: 'calc(100vh - 160px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 2.5,
                py: 2,
                backgroundColor: '#FAFAFA',
            }}>

                {/* Category Tabs — Billing Screen pill style */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                    <Tabs
                        value={categoryTab}
                        onChange={(_e, v) => setCategoryTab(v)}
                        variant="scrollable"
                        slotProps={{ indicator: { sx: { display: 'none' } } }}
                        sx={{
                            backgroundColor: '#fff',
                            minHeight: '10px',
                            borderRadius: '50px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            '& .MuiTabs-flexContainer': { justifyContent: 'center' },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '13px',
                                color: '#555',
                                fontWeight: 'bold',
                                minWidth: 0,
                                minHeight: '30px',
                                height: '30px',
                                px: 2,
                                m: 0.8,
                            },
                            '& .Mui-selected': {
                                color: `${websiteSettings.textColor} !important`,
                                bgcolor: websiteSettings.mainColor,
                                borderRadius: '50px',
                                boxShadow: '1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(0,0,0,0.1)',
                            },
                        }}
                    >
                        {categoryOptions.map((cat) => <Tab key={cat} label={cat} />)}
                    </Tabs>
                </Box>

                {filteredData.length === 0 && !isLoading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#D1D5DB' }}>
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#9CA3AF' }}>No feedback responses found</Typography>
                        <Typography sx={{ fontSize: '12px', mt: 0.5 }}>Try changing the filters or date</Typography>
                    </Box>
                )}

                {filteredData.map((dateGroup, dIdx) => {
                    const feedbackItems = (dateGroup.feedbacks || []).filter((item) =>
                        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (feedbackItems.length === 0) return null;

                    return (
                        <Box key={dIdx} sx={{ mb: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Box sx={{ width: 4, height: 14, bgcolor: websiteSettings.mainColor, borderRadius: '2px' }} />
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {dateGroup.postedDate} — {dateGroup.day}
                                </Typography>
                            </Box>

                            {feedbackItems.map((item, iIdx) => {
                                const panelKey = `p${dIdx}-${iIdx}`;
                                const isExpanded = !!expanded[panelKey];
                                const category = item.category || 'General';
                                const catColor = getCategoryColor(category);
                                const isSubject = category === 'Subject';

                                // For non-subject: use top-level questions + students
                                const topQuestions = normalizeQuestions(item.questions);
                                const topStudents = normalizeStudents(item.students);

                                // For subject: normalize each subject's questions + students
                                const subjectsList = (item.subjects || []).map((sub) => ({
                                    subjectId: sub.subjectId,
                                    subject: sub.subject,
                                    totalQuestions: sub.totalQuestions,
                                    respondedStudents: sub.respondedStudents,
                                    totalStudents: sub.totalStudents,
                                    completionPercentage: sub.completionPercentage,
                                    questions: normalizeQuestions(sub.questions),
                                    students: normalizeStudents(sub.students),
                                }));

                                const completionPercent = item.completionPercentage || 0;

                                return (
                                    <Paper key={iIdx} elevation={0} sx={{
                                        border: '1px solid #E5E7EB', borderRadius: '12px', mb: 2,
                                        overflow: 'hidden', backgroundColor: '#fff',
                                        maxWidth: '100%',
                                        transition: 'box-shadow 0.2s, border-color 0.2s',
                                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderColor: '#D1D5DB' },
                                    }}>
                                        {/* Header with accent stripe */}
                                        <Box sx={{
                                            position: 'relative',
                                            px: 2.5, py: 1.8,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            borderBottom: isExpanded ? '1px solid #F0F0F0' : 'none',
                                            cursor: 'pointer', gap: 2,
                                            backgroundColor: isExpanded ? '#FAFAFA' : '#fff',
                                            '&::before': {
                                                content: '""', position: 'absolute', left: 0, top: 0, bottom: 0,
                                                width: 3, backgroundColor: catColor.color,
                                            },
                                        }}
                                            onClick={() => setExpanded((prev) => ({ ...prev, [panelKey]: !prev[panelKey] }))}
                                        >
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6, flexWrap: 'wrap' }}>
                                                    <Chip label={category} size="small"
                                                        sx={{ height: 22, fontSize: '11px', fontWeight: 700, bgcolor: catColor.bg, color: catColor.color, border: `1px solid ${catColor.color}30` }}
                                                    />
                                                    <Chip label={`${item.totalQuestions || 0} Question${item.totalQuestions !== 1 ? 's' : ''}`} size="small"
                                                        sx={{ height: 22, fontSize: '11px', fontWeight: 600, bgcolor: '#F3F4F6', color: '#6B7280' }}
                                                    />
                                                    {isSubject && subjectsList.length > 0 && (
                                                        <Chip label={subjectsList.map((s) => s.subject).join(', ')} size="small"
                                                            sx={{ height: 22, fontSize: '11px', fontWeight: 600, bgcolor: '#FEF3C7', color: '#92400E' }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', mb: 0.4, lineHeight: 1.3 }}>
                                                    {item.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                    <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                        <b style={{ color: '#9CA3AF', fontWeight: 600 }}>Posted by:</b> {item.postedBy}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                        <b style={{ color: '#9CA3AF', fontWeight: 600 }}>Time:</b> {item.postedTime}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                        <b style={{ color: '#9CA3AF', fontWeight: 600 }}>Responses:</b>{' '}
                                                        <span style={{ color: completionPercent === 100 ? '#22C55E' : '#374151', fontWeight: 700 }}>
                                                            {item.responseText || `${item.respondedStudents || 0}/${item.totalStudents || 0}`}
                                                        </span>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
                                                    <LinearProgress variant="determinate" value={completionPercent}
                                                        sx={{
                                                            width: '100%', height: 6, borderRadius: 3, bgcolor: '#E5E7EB',
                                                            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: completionPercent === 100 ? '#22C55E' : catColor.color },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: completionPercent === 100 ? '#22C55E' : catColor.color, mt: 0.3 }}>
                                                        {item.completionText || `${completionPercent}% Complete`}
                                                    </Typography>
                                                </Box>

                                                <Button size="small"
                                                    onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [panelKey]: !p[panelKey] })); }}
                                                    sx={{
                                                        fontSize: '12px', textTransform: 'none', borderRadius: '999px', px: 2, fontWeight: 600,
                                                        color: websiteSettings.mainColor || '#E60154',
                                                        backgroundColor: `${websiteSettings.mainColor || '#E60154'}10`,
                                                        border: `1px solid ${websiteSettings.mainColor || '#E60154'}25`,
                                                        '&:hover': { backgroundColor: `${websiteSettings.mainColor || '#E60154'}20` },
                                                    }}
                                                >
                                                    {isExpanded ? 'Hide' : 'View'}
                                                    {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16, ml: 0.3 }} /> : <ExpandMoreIcon sx={{ fontSize: 16, ml: 0.3 }} />}
                                                </Button>

                                                {/* <Tooltip title="Delete feedback">
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(item.headerId, item.title); }}
                                                        sx={{ width: 30, height: 30, border: '1px solid #E5E7EB', bgcolor: '#fff', '&:hover': { bgcolor: '#FEE2E2', borderColor: '#EF4444' } }}>
                                                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                                                    </IconButton>
                                                </Tooltip> */}
                                            </Box>
                                        </Box>

                                        {/* Expanded */}
                                        {isExpanded && (
                                            <Box sx={{ px: 2, py: 2 }}>
                                                {!isSubject ? (
                                                    renderMultiQuestionTable(topQuestions, topStudents, `feedback-${dIdx}-${iIdx}`)
                                                ) : (
                                                    <Box>
                                                        {subjectsList.length === 0 ? (
                                                            <Box sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>
                                                                <Typography sx={{ fontSize: '13px' }}>No subjects configured</Typography>
                                                            </Box>
                                                        ) : (
                                                            <>
                                                                <Tabs
                                                                    value={activeSubjectTab[panelKey] || 0}
                                                                    onChange={(_e, v) => setActiveSubjectTab((p) => ({ ...p, [panelKey]: v }))}
                                                                    variant="scrollable"
                                                                    scrollButtons="auto"
                                                                    sx={{
                                                                        mb: 2, minHeight: 36, borderBottom: '1px solid #E5E7EB',
                                                                        '& .MuiTab-root': { textTransform: 'none', fontSize: '12px', fontWeight: 600, minHeight: 36, color: '#6B7280' },
                                                                        '& .Mui-selected': { color: `${catColor.color} !important` },
                                                                        '& .MuiTabs-indicator': { backgroundColor: catColor.color },
                                                                    }}
                                                                >
                                                                    {subjectsList.map((sub) => (
                                                                        <Tab key={sub.subjectId || sub.subject} label={
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                                                <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>{sub.subject}</Typography>
                                                                                <Chip label={sub.totalQuestions || sub.questions.length} size="small"
                                                                                    sx={{ height: 16, fontSize: '9px', fontWeight: 700, bgcolor: catColor.bg, color: catColor.color }}
                                                                                />
                                                                            </Box>
                                                                        } />
                                                                    ))}
                                                                </Tabs>

                                                                {subjectsList.map((sub, sIdx) => {
                                                                    if ((activeSubjectTab[panelKey] || 0) !== sIdx) return null;
                                                                    return (
                                                                        <Box key={sub.subjectId || sub.subject}>
                                                                            <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: catColor.bg, borderRadius: '8px', border: `1px solid ${catColor.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: catColor.color, letterSpacing: '0.3px' }}>
                                                                                    {sub.subject} — {sub.questions.length} Question{sub.questions.length !== 1 ? 's' : ''}
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: catColor.color }}>
                                                                                    {sub.respondedStudents || 0}/{sub.totalStudents || 0} responded · {sub.completionPercentage || 0}%
                                                                                </Typography>
                                                                            </Box>
                                                                            {renderMultiQuestionTable(sub.questions, sub.students, `feedback-${dIdx}-${iIdx}-${sub.subject}`)}
                                                                        </Box>
                                                                    );
                                                                })}
                                                            </>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Paper>
                                );
                            })}
                        </Box>
                    );
                })}

                {showButton && (
                    <Fab size="small" onClick={() => boxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        sx={{ position: 'fixed', bottom: 20, right: 20, width: 36, height: 36, bgcolor: '#1F2937', '&:hover': { bgcolor: '#374151' } }}>
                        <ArrowUpwardIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Fab>
                )}
            </Box>

            {/* Emoji Filter Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}
                PaperProps={{ sx: { bgcolor: '#1F2937', borderRadius: '10px', p: 0.5 } }}>
                <Box sx={{ display: 'flex', gap: 0.5, p: 0.5 }}>
                    {emojis.map((emoji, i) => (
                        <MenuItem key={i} onClick={() => handleFilterSelect(i + 1)}
                            sx={{ borderRadius: '6px', p: 0.8, minWidth: 'auto', '&:hover': { bgcolor: '#374151' } }}>
                            <img src={emoji} alt={emojiLabels[i]} width={22} />
                        </MenuItem>
                    ))}
                    <MenuItem onClick={() => handleFilterSelect('')}
                        sx={{ borderRadius: '6px', p: 0.8, minWidth: 'auto', '&:hover': { bgcolor: '#374151' } }}>
                        <CloseIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                    </MenuItem>
                </Box>
            </Menu>

            {/* Delete Confirmation Dialog — requires typing "delete" */}
            <Dialog open={openAlert} onClose={closeDeleteDialog} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: '14px', overflow: 'hidden' } }}>
                <Box sx={{ px: 3, pt: 3, pb: 1, textAlign: 'center' }}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: '50%', bgcolor: '#FEE2E2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 1.5,
                    }}>
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 28, color: '#DC2626' }} />
                    </Box>
                    <Typography sx={{ fontSize: '17px', fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                        Delete Feedback?
                    </Typography>
                    {deleteTitle && (
                        <Typography sx={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic', mb: 1 }}>
                            "{deleteTitle}"
                        </Typography>
                    )}
                </Box>

                <DialogContent sx={{ px: 3, py: 1 }}>
                    <Box sx={{
                        bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
                        p: 1.5, mb: 2,
                    }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', mb: 0.5 }}>
                            ⚠ This action cannot be undone
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#991B1B', lineHeight: 1.5 }}>
                            This feedback will be permanently deleted for <b>all classes &amp; sections</b> it was sent to. All student responses will be lost.
                        </Typography>
                    </Box>

                    <Typography sx={{ fontSize: '12px', color: '#374151', mb: 0.8 }}>
                        To confirm, type <b style={{ color: '#DC2626' }}>delete</b> below:
                    </Typography>
                    <TextField
                        fullWidth size="small" autoFocus
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder='Type "delete" to confirm'
                        slotProps={{
                            input: { sx: { height: '38px', fontSize: '13px', borderRadius: '6px' } },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#DC2626' },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
                    <Button fullWidth onClick={closeDeleteDialog}
                        sx={{ textTransform: 'none', borderRadius: '30px', fontSize: '13px', py: 0.8, border: '1px solid #D1D5DB', color: '#374151', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button fullWidth onClick={confirmDelete}
                        disabled={deleteConfirmText !== 'delete'}
                        sx={{
                            textTransform: 'none', borderRadius: '30px', fontSize: '13px', py: 0.8,
                            bgcolor: '#DC2626', color: '#fff', fontWeight: 600,
                            '&:hover': { bgcolor: '#B91C1C' },
                            '&.Mui-disabled': { bgcolor: '#FCA5A5', color: '#fff' },
                        }}>
                        Delete Feedback
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={openImage} onClose={() => setOpenImage(false)}
                sx={{ '& .MuiPaper-root': { backgroundColor: 'transparent', boxShadow: 'none', borderRadius: 0, overflow: 'visible' } }}
                slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.85)' } } }}>
                <img src={imageUrl} alt="Student" style={{ width: '25vw', maxHeight: '80vh', borderRadius: '8px' }} />
                <IconButton onClick={() => setOpenImage(false)} sx={{ position: 'absolute', top: -8, right: -40 }}>
                    <CloseIcon sx={{ color: '#fff' }} />
                </IconButton>
            </Dialog>
        </Box>
    );
}
