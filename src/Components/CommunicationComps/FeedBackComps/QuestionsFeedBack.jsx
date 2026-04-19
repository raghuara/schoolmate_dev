import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Paper, Popover, Switch, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { deleteNewFeedbackByTitleId, fetchNewFeedbackAdminResponses, updateNewFeedbackQuestions } from "../../../Api/Api";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { selectSidebarExpanded } from "../../../Redux/Slices/sidebarSlice";
import PoorEmoji from '../../../Images/emoji/poor.png';
import AverageEmoji from '../../../Images/emoji/average.png';
import GoodEmoji from '../../../Images/emoji/good.png';
import ExcellentEmoji from '../../../Images/emoji/excellent.png';

const emojis = [PoorEmoji, AverageEmoji, GoodEmoji, ExcellentEmoji];
const emojiLabels = ['Poor', 'Average', 'Good', 'Excellent'];

const CATEGORY_COLORS = {
    Management: { color: '#6366F1', bg: '#EEF2FF' },
    General: { color: '#0891B2', bg: '#ECFEFF' },
    Subject: { color: '#D97706', bg: '#FFFBEB' },
};

const TYPE_META = {
    ratings: { label: 'Ratings', icon: StarBorderIcon },
    multiplechoice: { label: 'Multiple Choice', icon: RadioButtonCheckedIcon },
    openended: { label: 'Open-Ended', icon: NotesOutlinedIcon },
};

// Normalize questions from API shape
const normalizeQuestions = (questions = []) =>
    (questions || []).map((q, i) => ({
        questionId: q.questionId,
        questionNo: i + 1,
        question: q.question,
        feedBackType: q.feedBackType || 'openended',
        required: q.required === 'Y',
        options: [q.option01, q.option02, q.option03, q.option04].filter(Boolean),
    }));

// Editable question card (used in the Edit Dialog)
const EditQuestionCard = ({ q, qIdx, onUpdate, onTypeChange, onOptionChange, onAddOption, onRemoveOption, onRemove, totalQuestions, mainColor, questionTypeOptions }) => {
    return (
        <Box sx={{
            border: '1px solid #E5E7EB',
            borderLeft: `3px solid ${mainColor}`,
            borderRadius: '10px',
            backgroundColor: '#fff',
            mb: 2,
            overflow: 'hidden',
        }}>
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 2, py: 1, bgcolor: '#FAFAFA', borderBottom: '1px solid #F0F0F0',
            }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                    Question {qIdx + 1}
                    {q.required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>Required</Typography>
                    <Switch size="small" checked={q.required}
                        onChange={(e) => onUpdate('required', e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: mainColor },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: mainColor },
                        }}
                    />
                    {totalQuestions > 1 && (
                        <IconButton size="small" onClick={onRemove} sx={{ color: '#EF4444', width: 24, height: 24 }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}
                </Box>
            </Box>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>Type</Typography>
                        <Autocomplete
                            disablePortal size="small"
                            options={questionTypeOptions}
                            getOptionLabel={(option) => option.label}
                            value={questionTypeOptions.find((opt) => opt.value === q.feedBackType) || null}
                            onChange={(_e, v) => onTypeChange(v)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Select Type"
                                    slotProps={{ input: { ...params.InputProps, sx: { height: '36px', fontSize: '13px', backgroundColor: '#fff' } } }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>Question</Typography>
                        <TextField
                            size="small" fullWidth multiline minRows={1} maxRows={3}
                            placeholder="Enter question text..."
                            value={q.question}
                            onChange={(e) => onUpdate('question', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', backgroundColor: '#fff' } }}
                        />
                    </Grid>
                </Grid>

                {q.feedBackType === 'multiplechoice' && (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Options</Typography>
                            {q.options.length < 4 && (
                                <IconButton size="small" onClick={onAddOption} sx={{ color: '#22C55E', ml: 0.5 }}>
                                    <AddIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>
                        <Grid container spacing={1.2}>
                            {q.options.map((opt, optIdx) => (
                                <Grid key={optIdx} size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TextField
                                            size="small" fullWidth value={opt}
                                            placeholder={`Option ${optIdx + 1}`}
                                            onChange={(e) => onOptionChange(optIdx, e.target.value)}
                                            inputProps={{ maxLength: 50 }}
                                            sx={{ '& .MuiOutlinedInput-root': { height: 34, fontSize: '13px', borderRadius: '6px', backgroundColor: '#fff' } }}
                                        />
                                        {q.options.length > 2 && (
                                            <IconButton size="small" onClick={() => onRemoveOption(optIdx)} sx={{ color: '#EF4444' }}>
                                                <RemoveCircleIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

// Single Question Card (read-only)
const QuestionDisplay = ({ q, mainColor }) => {
    const meta = TYPE_META[q.feedBackType] || TYPE_META.openended;
    const TypeIcon = meta.icon;

    return (
        <Box sx={{
            border: '1px solid #F0F0F0',
            borderLeft: `3px solid ${mainColor}`,
            borderRadius: '8px',
            backgroundColor: '#fff',
            p: 1.8,
            mb: 1.2,
        }}>
            {/* Question header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{
                        minWidth: 24, height: 20, px: 0.8, borderRadius: '6px',
                        bgcolor: `${mainColor}15`, color: mainColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700 }}>Q{q.questionNo}</Typography>
                    </Box>
                    <Chip
                        icon={<TypeIcon sx={{ fontSize: '12px !important', color: '#6B7280 !important' }} />}
                        label={meta.label}
                        size="small"
                        sx={{ height: 20, fontSize: '10px', fontWeight: 600, bgcolor: '#F3F4F6', color: '#6B7280' }}
                    />
                    {q.required && (
                        <Chip label="Required" size="small"
                            sx={{ height: 20, fontSize: '10px', fontWeight: 600, bgcolor: '#FEE2E2', color: '#DC2626' }}
                        />
                    )}
                </Box>
            </Box>

            {/* Question text */}
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', mb: q.feedBackType === 'openended' ? 0 : 1 }}>
                {q.question}
            </Typography>

            {/* Type-specific preview */}
            {q.feedBackType === 'ratings' && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                    {emojis.map((emo, i) => (
                        <Box key={i} sx={{ textAlign: 'center' }}>
                            <img src={emo} alt={emojiLabels[i]} width={24} />
                            <Typography sx={{ fontSize: '9px', color: '#9CA3AF', mt: 0.2 }}>{emojiLabels[i]}</Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {q.feedBackType === 'multiplechoice' && q.options.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 0.3 }}>
                    {q.options.map((opt, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6 }}>
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 0.8,
                                border: '1px solid #E5E7EB', borderRadius: '6px',
                                px: 1, py: 0.6, bgcolor: '#FAFAFA',
                            }}>
                                <RadioButtonCheckedIcon sx={{ fontSize: 14, color: '#D1D5DB' }} />
                                <Typography sx={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>
                                    {i + 1}. {opt}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}

            {q.feedBackType === 'openended' && (
                <Box sx={{
                    mt: 1, p: 1.2, border: '1px dashed #E5E7EB', borderRadius: '6px',
                    bgcolor: '#FAFAFA', height: 48, display: 'flex', alignItems: 'center',
                }}>
                    <Typography sx={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                        Student's open-ended response will appear here...
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default function QuestionsFeedBackPage() {
    const location = useLocation();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    const isExpanded = useSelector(selectSidebarExpanded);

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

    const [openAlert, setOpenAlert] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [deleteTitle, setDeleteTitle] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const [categoryTab, setCategoryTab] = useState(0);
    const categoryOptions = ['All', 'Management', 'General', 'Subject'];

    const [activeSubjectTab, setActiveSubjectTab] = useState({});

    // Audience popover state
    const [audienceAnchor, setAudienceAnchor] = useState(null);
    const [audienceFeedback, setAudienceFeedback] = useState(null);

    // Edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [editSubjectTab, setEditSubjectTab] = useState(0);

    const [showButton, setShowButton] = useState(false);
    const boxRef = useRef(null);

    // Collect unique { grade, sections[] } groups from a feedback item (Management/General + Subject)
    const getAudience = (item) => {
        const students = [];
        (item.students || []).forEach((s) => students.push(s));
        (item.subjects || []).forEach((sub) => (sub.students || []).forEach((s) => students.push(s)));

        const gradeMap = new Map();
        students.forEach((s) => {
            if (!s.grade) return;
            const key = `${s.gradeId}-${s.grade}`;
            if (!gradeMap.has(key)) {
                gradeMap.set(key, { gradeId: s.gradeId, grade: s.grade, sections: new Set() });
            }
            if (s.section) gradeMap.get(key).sections.add(s.section);
        });
        return Array.from(gradeMap.values()).map((g) => ({
            ...g,
            sections: Array.from(g.sections).sort(),
        }));
    };

    const openAudience = (e, item) => {
        e.stopPropagation();
        setAudienceFeedback(item);
        setAudienceAnchor(e.currentTarget);
    };
    const closeAudience = () => {
        setAudienceAnchor(null);
        setAudienceFeedback(null);
    };

    // ===== Edit Dialog =====
    // Collect unique gradeSections from students of a feedback item (used for payload)
    const collectGradeSections = (students = []) => {
        const map = new Map();
        (students || []).forEach((s) => {
            if (!s.gradeId) return;
            if (!map.has(s.gradeId)) map.set(s.gradeId, new Set());
            if (s.section) map.get(s.gradeId).add(s.section);
        });
        return Array.from(map.entries()).map(([gradeId, secs]) => ({
            gradeId,
            sections: Array.from(secs).sort(),
        }));
    };

    const openEdit = (item) => {
        const category = item.category || 'General';
        if (category === 'Subject') {
            setEditForm({
                headerId: item.headerId,
                category: 'Subject',
                title: item.title || '',
                subjects: (item.subjects || []).map((sub) => ({
                    subject: sub.subject,
                    gradeSections: collectGradeSections(sub.students),
                    questions: normalizeQuestions(sub.questions).map((q) => ({
                        question: q.question || '',
                        feedBackType: q.feedBackType,
                        required: q.required,
                        options: q.options.length > 0 ? [...q.options] : ['', ''],
                    })),
                })),
            });
        } else {
            setEditForm({
                headerId: item.headerId,
                category,
                title: item.title || '',
                gradeSections: collectGradeSections(item.students),
                questions: normalizeQuestions(item.questions).map((q) => ({
                    question: q.question || '',
                    feedBackType: q.feedBackType,
                    required: q.required,
                    options: q.options.length > 0 ? [...q.options] : ['', ''],
                })),
            });
        }
        setEditSubjectTab(0);
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setEditForm(null);
    };

    const questionTypeOptions = [
        { label: 'Ratings', value: 'ratings' },
        { label: 'Multiple Choice', value: 'multiplechoice' },
        { label: 'Open-Ended', value: 'openended' },
    ];

    // Question updater — works for both flat and subject-based forms
    const updateQuestion = (qIdx, field, value, subjectIdx = null) => {
        setEditForm((prev) => {
            if (!prev) return prev;
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                const qs = [...subjects[subjectIdx].questions];
                qs[qIdx] = { ...qs[qIdx], [field]: value };
                subjects[subjectIdx] = { ...subjects[subjectIdx], questions: qs };
                return { ...prev, subjects };
            }
            const qs = [...prev.questions];
            qs[qIdx] = { ...qs[qIdx], [field]: value };
            return { ...prev, questions: qs };
        });
    };

    const updateQuestionType = (qIdx, newValue, subjectIdx = null) => {
        const value = newValue ? newValue.value : '';
        setEditForm((prev) => {
            if (!prev) return prev;
            const apply = (qs) => {
                const updated = [...qs];
                updated[qIdx] = { ...updated[qIdx], feedBackType: value, options: ['', ''] };
                return updated;
            };
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                subjects[subjectIdx] = { ...subjects[subjectIdx], questions: apply(subjects[subjectIdx].questions) };
                return { ...prev, subjects };
            }
            return { ...prev, questions: apply(prev.questions) };
        });
    };

    const updateOption = (qIdx, optIdx, value, subjectIdx = null) => {
        setEditForm((prev) => {
            if (!prev) return prev;
            const apply = (qs) => {
                const updated = [...qs];
                const opts = [...updated[qIdx].options];
                opts[optIdx] = value;
                updated[qIdx] = { ...updated[qIdx], options: opts };
                return updated;
            };
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                subjects[subjectIdx] = { ...subjects[subjectIdx], questions: apply(subjects[subjectIdx].questions) };
                return { ...prev, subjects };
            }
            return { ...prev, questions: apply(prev.questions) };
        });
    };

    const addOption = (qIdx, subjectIdx = null) => {
        setEditForm((prev) => {
            if (!prev) return prev;
            const apply = (qs) => {
                const updated = [...qs];
                if (updated[qIdx].options.length >= 4) return updated;
                updated[qIdx] = { ...updated[qIdx], options: [...updated[qIdx].options, ''] };
                return updated;
            };
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                subjects[subjectIdx] = { ...subjects[subjectIdx], questions: apply(subjects[subjectIdx].questions) };
                return { ...prev, subjects };
            }
            return { ...prev, questions: apply(prev.questions) };
        });
    };

    const removeOption = (qIdx, optIdx, subjectIdx = null) => {
        setEditForm((prev) => {
            if (!prev) return prev;
            const apply = (qs) => {
                const updated = [...qs];
                if (updated[qIdx].options.length <= 2) return updated;
                const opts = [...updated[qIdx].options];
                opts.splice(optIdx, 1);
                updated[qIdx] = { ...updated[qIdx], options: opts };
                return updated;
            };
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                subjects[subjectIdx] = { ...subjects[subjectIdx], questions: apply(subjects[subjectIdx].questions) };
                return { ...prev, subjects };
            }
            return { ...prev, questions: apply(prev.questions) };
        });
    };

    const addQuestion = (subjectIdx = null) => {
        const newQ = { question: '', feedBackType: 'ratings', required: false, options: ['', ''] };
        setEditForm((prev) => {
            if (!prev) return prev;
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                if (subjects[subjectIdx].questions.length >= 20) return prev;
                subjects[subjectIdx] = { ...subjects[subjectIdx], questions: [...subjects[subjectIdx].questions, newQ] };
                return { ...prev, subjects };
            }
            if (prev.questions.length >= 20) return prev;
            return { ...prev, questions: [...prev.questions, newQ] };
        });
    };

    const removeQuestion = (qIdx, subjectIdx = null) => {
        setEditForm((prev) => {
            if (!prev) return prev;
            if (subjectIdx !== null) {
                const subjects = [...prev.subjects];
                if (subjects[subjectIdx].questions.length <= 1) return prev;
                subjects[subjectIdx] = {
                    ...subjects[subjectIdx],
                    questions: subjects[subjectIdx].questions.filter((_, i) => i !== qIdx),
                };
                return { ...prev, subjects };
            }
            if (prev.questions.length <= 1) return prev;
            return { ...prev, questions: prev.questions.filter((_, i) => i !== qIdx) };
        });
    };

    const buildSavePayload = () => {
        const buildQuestions = (qs) =>
            qs.map((q) => {
                const base = {
                    question: q.question,
                    feedBackType: q.feedBackType || 'ratings',
                    required: q.required ? 'Y' : 'N',
                };
                if (q.feedBackType === 'multiplechoice') {
                    (q.options || []).forEach((opt, i) => {
                        if (opt && opt.trim() !== '') base[`option0${i + 1}`] = opt;
                    });
                }
                return base;
            });

        const postedOn = dayjs().format('DD-MM-YYYY HH:mm');
        const common = {
            headerId: editForm.headerId,
            category: editForm.category,
            title: editForm.title,
            postedOn,
            updatedByRollNumber: user.rollNumber || '',
            updatedByUserType: user.userType || '',
        };

        if (editForm.category === 'Subject') {
            return {
                ...common,
                subjects: editForm.subjects.map((sub) => ({
                    subject: sub.subject,
                    gradeSections: sub.gradeSections,
                    questions: buildQuestions(sub.questions),
                })),
            };
        }
        return {
            ...common,
            gradeSections: editForm.gradeSections,
            questions: buildQuestions(editForm.questions),
        };
    };

    const validateEdit = () => {
        if (!editForm?.title?.trim()) return 'Title is required';
        const check = (qs, label) => {
            for (let i = 0; i < qs.length; i++) {
                const q = qs[i];
                if (!q.question.trim()) return `${label} Question ${i + 1}: text is required`;
                if (!q.feedBackType) return `${label} Question ${i + 1}: select a type`;
                if (q.feedBackType === 'multiplechoice') {
                    if (!q.options?.[0]?.trim() || !q.options?.[1]?.trim()) {
                        return `${label} Question ${i + 1}: at least 2 options required`;
                    }
                }
            }
            return null;
        };
        if (editForm.category === 'Subject') {
            for (const sub of editForm.subjects) {
                const err = check(sub.questions, `[${sub.subject}]`);
                if (err) return err;
            }
        } else {
            const err = check(editForm.questions, '');
            if (err) return err;
        }
        return null;
    };

    const saveEdit = async () => {
        const err = validateEdit();
        if (err) {
            setOpen(true); setColor(false); setStatus(false);
            setMessage(err);
            return;
        }
        setEditSaving(true);
        try {
            const payload = buildSavePayload();
            await axios.post(updateNewFeedbackQuestions, payload, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            setOpen(true); setColor(true); setStatus(true);
            setMessage('Feedback updated successfully');
            closeEdit();
            fetchData();
        } catch (error) {
            console.error(error);
            setOpen(true); setColor(false); setStatus(false);
            setMessage(error.response?.data?.message || 'Failed to update feedback');
        } finally {
            setEditSaving(false);
        }
    };

    useEffect(() => { fetchData(); }, [categoryTab]);

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
            const res = await axios.get(fetchNewFeedbackAdminResponses, {
                params: { category: categoryOptions[categoryTab] },
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllData(res.data?.data || []);
        } catch (e) {
            console.error(e);
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

    const getCategoryColor = (c) => CATEGORY_COLORS[c] || { color: '#6B7280', bg: '#F3F4F6' };

    // Dedupe feedbacks by headerId, keep first occurrence per date group, and apply search + category filter
    const filteredData = useMemo(() => {
        const seenIds = new Set();
        return (allData || []).map((dg) => {
            const unique = (dg.feedbacks || []).filter((item) => {
                if (seenIds.has(item.headerId)) return false;
                const title = (item.title || '').toLowerCase();
                if (!title.includes(searchQuery.toLowerCase())) return false;
                seenIds.add(item.headerId);
                return true;
            });
            return { ...dg, feedbacks: unique };
        }).filter((dg) => dg.feedbacks.length > 0);
    }, [allData, searchQuery]);

    if (userType !== 'superadmin' && userType !== 'admin' && userType !== 'staff') {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* Header — fixed so it stays on scroll */}
            <Box sx={{ backgroundColor: '#f2f2f2', px: 2.5, py: 1.2, borderBottom: '1px solid #E5E7EB' }}>
                <Grid container alignItems="center" spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Link style={{ textDecoration: 'none' }} to="/dashboardmenu/feedback">
                            <IconButton sx={{ width: 28, height: 28 }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#1F2937' }}>Asked Feedback</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 5, lg: 6 }}>
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

                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Link to="/dashboardmenu/feedback/responses" style={{ textDecoration: 'none' }}>
                            <Button
                                size="small"
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                                    color: '#6366F1', bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)',
                                    borderRadius: '20px', px: 2.5, height: 33,
                                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)' },
                                }}>
                                Responses Received
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
            </Box>

            {/* Content */}
            <Box ref={boxRef} sx={{ height: 'calc(100vh - 160px)', overflowY: 'auto', p: 2 }}>

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
                    <Box sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '55vh', color: '#D1D5DB', border: '2px dashed #E5E7EB',
                        borderRadius: '12px', backgroundColor: '#FAFAFA',
                    }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#9CA3AF' }}>No feedback questions found</Typography>
                        <Typography sx={{ fontSize: '12px', mt: 0.5 }}>Try changing the filters</Typography>
                    </Box>
                )}

                {filteredData.map((dateGroup, dIdx) => (
                    <Box key={dIdx} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Box sx={{ width: 4, height: 14, bgcolor: websiteSettings.mainColor, borderRadius: '2px' }} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {dateGroup.postedDate} — {dateGroup.day}
                            </Typography>
                        </Box>

                        {dateGroup.feedbacks.map((item, iIdx) => {
                            const category = item.category || 'General';
                            const catColor = getCategoryColor(category);
                            const isSubject = category === 'Subject';
                            const panelKey = `p${dIdx}-${iIdx}-${item.headerId}`;

                            const topQuestions = normalizeQuestions(item.questions);

                            // For subject: normalize each subject's questions
                            const subjectsList = (item.subjects || []).map((sub) => ({
                                subjectId: sub.subjectId,
                                subject: sub.subject,
                                totalQuestions: sub.totalQuestions,
                                questions: normalizeQuestions(sub.questions),
                            }));

                            return (
                                <Paper key={item.headerId} elevation={0} sx={{
                                    border: '1px solid #E5E7EB', borderRadius: '12px', mb: 2,
                                    overflow: 'hidden', transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                                }}>
                                    {/* Card Header */}
                                    <Box sx={{
                                        px: 2.5, py: 1.8, borderBottom: '1px solid #F0F0F0',
                                        backgroundColor: '#FAFAFA',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2,
                                    }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, flexWrap: 'wrap' }}>
                                                <Chip label={category} size="small"
                                                    sx={{ height: 22, fontSize: '11px', fontWeight: 700, bgcolor: catColor.bg, color: catColor.color, border: `1px solid ${catColor.color}30` }}
                                                />
                                                <Chip
                                                    label={`${item.totalQuestions || 0} Question${item.totalQuestions !== 1 ? 's' : ''}`}
                                                    size="small"
                                                    sx={{ height: 22, fontSize: '11px', fontWeight: 600, bgcolor: '#F3F4F6', color: '#6B7280' }}
                                                />
                                                {isSubject && subjectsList.length > 0 && (
                                                    <Chip label={subjectsList.map((s) => s.subject).join(', ')} size="small"
                                                        sx={{ height: 22, fontSize: '11px', fontWeight: 600, bgcolor: '#FEF3C7', color: '#92400E' }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', mb: 0.3 }}>
                                                {item.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                    <b style={{ color: '#9CA3AF' }}>Posted by:</b> {item.postedBy}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                    <b style={{ color: '#9CA3AF' }}>Time:</b> {item.postedTime}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                    <b style={{ color: '#9CA3AF' }}>Audience:</b> {item.totalStudents || 0} student{item.totalStudents !== 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                            <Tooltip title="View audience (classes & sections)">
                                                <Button
                                                    size="small"
                                                    onClick={(e) => openAudience(e, item)}
                                                    startIcon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                        textTransform: 'none', fontSize: '11px', fontWeight: 600,
                                                        color: catColor.color, bgcolor: catColor.bg,
                                                        border: `1px solid ${catColor.color}30`,
                                                        borderRadius: '20px', px: 1.5, height: 28,
                                                        '&:hover': { bgcolor: catColor.bg, borderColor: catColor.color, opacity: 0.9 },
                                                    }}
                                                >
                                                    View Audience
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Edit feedback">
                                                <IconButton size="small" onClick={() => openEdit(item)}
                                                    sx={{ width: 30, height: 30, border: '1px solid #E5E7EB', bgcolor: '#fff', '&:hover': { bgcolor: '#EEF2FF', borderColor: '#6366F1' } }}>
                                                    <EditOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete feedback">
                                                <IconButton size="small" onClick={() => handleDelete(item.headerId, item.title)}
                                                    sx={{ width: 30, height: 30, border: '1px solid #E5E7EB', bgcolor: '#fff', '&:hover': { bgcolor: '#FEE2E2', borderColor: '#EF4444' } }}>
                                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {/* Card Body — Questions */}
                                    <Box sx={{ p: 2.5 }}>
                                        {!isSubject ? (
                                            <Box>
                                                {topQuestions.length === 0 ? (
                                                    <Typography sx={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', py: 2 }}>
                                                        No questions configured
                                                    </Typography>
                                                ) : (
                                                    topQuestions.map((q) => (
                                                        <QuestionDisplay key={q.questionId} q={q} mainColor={websiteSettings.mainColor || '#E60154'} />
                                                    ))
                                                )}
                                            </Box>
                                        ) : (
                                            <Box>
                                                {subjectsList.length === 0 ? (
                                                    <Typography sx={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', py: 2 }}>
                                                        No subjects configured
                                                    </Typography>
                                                ) : (
                                                    <>
                                                        {/* Subject tabs */}
                                                        <Tabs
                                                            value={activeSubjectTab[panelKey] || 0}
                                                            onChange={(_e, v) => setActiveSubjectTab((p) => ({ ...p, [panelKey]: v }))}
                                                            variant="scrollable" scrollButtons="auto"
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
                                                                    <Box sx={{
                                                                        mb: 1.5, p: 1.2, backgroundColor: catColor.bg,
                                                                        borderRadius: '8px', border: `1px solid ${catColor.color}30`,
                                                                    }}>
                                                                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: catColor.color, letterSpacing: '0.3px' }}>
                                                                            {sub.subject} — {sub.questions.length} Question{sub.questions.length !== 1 ? 's' : ''}
                                                                        </Typography>
                                                                    </Box>
                                                                    {sub.questions.map((q) => (
                                                                        <QuestionDisplay key={q.questionId} q={q} mainColor={catColor.color} />
                                                                    ))}
                                                                </Box>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                ))}

                {showButton && (
                    <Fab size="small" onClick={() => boxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        sx={{ position: 'fixed', bottom: 20, right: 20, width: 36, height: 36, bgcolor: '#1F2937', '&:hover': { bgcolor: '#374151' } }}>
                        <ArrowUpwardIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Fab>
                )}
            </Box>

            {/* Audience Popover — shows classes & sections */}
            <Popover
                open={Boolean(audienceAnchor)}
                anchorEl={audienceAnchor}
                onClose={closeAudience}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 0.5, borderRadius: '12px', border: '1px solid #E5E7EB',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
                            minWidth: 260, maxWidth: 360,
                        },
                    },
                }}
            >
                {audienceFeedback && (() => {
                    const aud = getAudience(audienceFeedback);
                    const totalSections = aud.reduce((sum, g) => sum + g.sections.length, 0);
                    return (
                        <Box>
                            <Box sx={{
                                px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1,
                                backgroundColor: '#FAFAFA', borderBottom: '1px solid #F0F0F0',
                            }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 18, color: websiteSettings.mainColor }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>
                                        Audience
                                    </Typography>
                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}>
                                        {aud.length} class{aud.length !== 1 ? 'es' : ''} · {totalSections} section{totalSections !== 1 ? 's' : ''} · {audienceFeedback.totalStudents || 0} student{audienceFeedback.totalStudents !== 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                                {aud.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 3, color: '#9CA3AF' }}>
                                        <Typography sx={{ fontSize: '12px' }}>No audience data available</Typography>
                                    </Box>
                                ) : (
                                    aud.map((g) => (
                                        <Box key={g.gradeId} sx={{
                                            px: 2, py: 1.2, borderBottom: '1px solid #F0F0F0',
                                            '&:last-child': { borderBottom: 'none' },
                                        }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#374151', mb: 0.6 }}>
                                                {g.grade}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {g.sections.map((sec) => (
                                                    <Chip
                                                        key={sec} label={sec} size="small"
                                                        sx={{
                                                            height: 20, fontSize: '10px', fontWeight: 600,
                                                            bgcolor: `${websiteSettings.mainColor}10`,
                                                            color: websiteSettings.mainColor,
                                                            border: `1px solid ${websiteSettings.mainColor}25`,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    );
                })()}
            </Popover>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onClose={closeEdit} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}>
                <DialogTitle sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2.5, py: 1.5, borderBottom: '1px solid #F0F0F0', backgroundColor: '#FAFAFA',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '8px',
                            bgcolor: `${websiteSettings.mainColor}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <EditOutlinedIcon sx={{ fontSize: 18, color: websiteSettings.mainColor }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>
                                Edit Feedback
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                {editForm?.category || ''} · Update title and questions
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeEdit}>
                        <CloseIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5, backgroundColor: '#FAFAFA' }}>
                    {editForm && (
                        <Box>
                            {/* Title field */}
                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>
                                Feedback Title
                            </Typography>
                            <TextField
                                fullWidth size="small" value={editForm.title}
                                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Enter feedback title..."
                                sx={{
                                    mb: 2.5, backgroundColor: '#fff',
                                    '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px' },
                                }}
                                slotProps={{ input: { sx: { height: '38px', fontSize: '13px', fontWeight: 500 } } }}
                            />

                            {editForm.category !== 'Subject' ? (
                                // Management / General — single list
                                <Box>
                                    {editForm.questions.map((q, qIdx) => (
                                        <EditQuestionCard
                                            key={qIdx} q={q} qIdx={qIdx}
                                            onUpdate={(field, val) => updateQuestion(qIdx, field, val)}
                                            onTypeChange={(val) => updateQuestionType(qIdx, val)}
                                            onOptionChange={(oIdx, val) => updateOption(qIdx, oIdx, val)}
                                            onAddOption={() => addOption(qIdx)}
                                            onRemoveOption={(oIdx) => removeOption(qIdx, oIdx)}
                                            onRemove={() => removeQuestion(qIdx)}
                                            totalQuestions={editForm.questions.length}
                                            mainColor={websiteSettings.mainColor}
                                            questionTypeOptions={questionTypeOptions}
                                        />
                                    ))}
                                    {editForm.questions.length < 20 && (
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion()} fullWidth
                                            sx={{
                                                textTransform: 'none', borderStyle: 'dashed', borderColor: '#D1D5DB', color: '#6B7280',
                                                borderRadius: '8px', py: 1, fontSize: '12px', fontWeight: 600,
                                                '&:hover': { borderColor: websiteSettings.mainColor, color: websiteSettings.mainColor, backgroundColor: `${websiteSettings.mainColor}08` },
                                            }}>
                                            Add Question ({editForm.questions.length}/20)
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                // Subject — tabs per subject
                                <Box>
                                    <Tabs
                                        value={editSubjectTab}
                                        onChange={(_e, v) => setEditSubjectTab(v)}
                                        variant="scrollable" scrollButtons="auto"
                                        sx={{
                                            mb: 2, minHeight: 36, borderBottom: '1px solid #E5E7EB',
                                            '& .MuiTab-root': { textTransform: 'none', fontSize: '12px', fontWeight: 600, minHeight: 36, color: '#6B7280' },
                                            '& .Mui-selected': { color: `${websiteSettings.mainColor} !important` },
                                            '& .MuiTabs-indicator': { backgroundColor: websiteSettings.mainColor },
                                        }}
                                    >
                                        {editForm.subjects.map((sub) => (
                                            <Tab key={sub.subject} label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>{sub.subject}</Typography>
                                                    <Chip label={sub.questions.length} size="small"
                                                        sx={{ height: 16, fontSize: '9px', fontWeight: 700, bgcolor: `${websiteSettings.mainColor}15`, color: websiteSettings.mainColor }}
                                                    />
                                                </Box>
                                            } />
                                        ))}
                                    </Tabs>

                                    {editForm.subjects.map((sub, sIdx) => {
                                        if (editSubjectTab !== sIdx) return null;
                                        return (
                                            <Box key={sub.subject}>
                                                {sub.questions.map((q, qIdx) => (
                                                    <EditQuestionCard
                                                        key={qIdx} q={q} qIdx={qIdx}
                                                        onUpdate={(field, val) => updateQuestion(qIdx, field, val, sIdx)}
                                                        onTypeChange={(val) => updateQuestionType(qIdx, val, sIdx)}
                                                        onOptionChange={(oIdx, val) => updateOption(qIdx, oIdx, val, sIdx)}
                                                        onAddOption={() => addOption(qIdx, sIdx)}
                                                        onRemoveOption={(oIdx) => removeOption(qIdx, oIdx, sIdx)}
                                                        onRemove={() => removeQuestion(qIdx, sIdx)}
                                                        totalQuestions={sub.questions.length}
                                                        mainColor={websiteSettings.mainColor}
                                                        questionTypeOptions={questionTypeOptions}
                                                    />
                                                ))}
                                                {sub.questions.length < 20 && (
                                                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion(sIdx)} fullWidth
                                                        sx={{
                                                            textTransform: 'none', borderStyle: 'dashed', borderColor: '#D1D5DB', color: '#6B7280',
                                                            borderRadius: '8px', py: 1, fontSize: '12px', fontWeight: 600,
                                                            '&:hover': { borderColor: websiteSettings.mainColor, color: websiteSettings.mainColor, backgroundColor: `${websiteSettings.mainColor}08` },
                                                        }}>
                                                        Add Question ({sub.questions.length}/20)
                                                    </Button>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F0F0F0', gap: 1 }}>
                    <Button onClick={closeEdit} disabled={editSaving}
                        sx={{ textTransform: 'none', borderRadius: '30px', fontSize: '13px', px: 3, border: '1px solid #D1D5DB', color: '#374151', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button onClick={saveEdit} disabled={editSaving}
                        startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: 'none', borderRadius: '30px', fontSize: '13px', px: 3,
                            bgcolor: websiteSettings.mainColor, color: websiteSettings.textColor, fontWeight: 600, boxShadow: 'none',
                            '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9, boxShadow: 'none' },
                            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                        }}>
                        {editSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog — requires typing "delete" */}
            <Dialog open={openAlert} onClose={closeDeleteDialog} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: '14px', overflow: 'hidden' } }}>
                {/* Header with warning icon */}
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
                    {/* Warning box */}
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
        </Box>
    );
}
