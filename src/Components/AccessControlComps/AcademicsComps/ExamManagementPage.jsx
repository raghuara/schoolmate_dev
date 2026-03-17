import { Box, Grid, IconButton, Typography, Dialog, DialogContent, DialogActions, TextField, Button, Chip, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import Loader from '../../Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { getAllExams, getExamsByGradeId, updateExamsByGradeId } from '../../../Api/Api';
import CloseIcon from "@mui/icons-material/Close";
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import EditIcon from '@mui/icons-material/Edit';
import ArticleIcon from '@mui/icons-material/Article';
import SnackBar from '../../SnackBar';

const CATEGORIES = ['Nursery', 'Primary', 'Secondary', 'Higher Secondary'];

const CATEGORY_COLORS = {
    'Nursery':          { color: '#E91E8C', bg: '#FDE8F4', chipBg: '#FCE4F2' },
    'Primary':          { color: '#1976D2', bg: '#E3F2FD', chipBg: '#DBEFFE' },
    'Secondary':        { color: '#388E3C', bg: '#E8F5E9', chipBg: '#D9F0DB' },
    'Higher Secondary': { color: '#F57C00', bg: '#FFF3E0', chipBg: '#FFE9C8' },
};

export default function ExamManagementPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state) => state.auth);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const rollNumber = user.rollNumber;
    const userType = user.userType;
    const token = "123";
    const grades = useSelector(selectGrades);

    const [allExamsData, setAllExamsData] = useState([]);
    const [openExamPopup, setOpenExamPopup] = useState(false);
    const [selectedGradeId, setSelectedGradeId] = useState(0);
    const [selectedGradeSign, setSelectedGradeSign] = useState('');
    const [selectedGradeCategory, setSelectedGradeCategory] = useState('');
    const [exam, setExam] = useState('');
    const [selectedExam, setSelectedExam] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Nursery');

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAllExam();
    }, []);

    const fetchAllExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAllExams, {
                params: { RollNumber: rollNumber, UserType: userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllExamsData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Merge grades with fetched exam data
    const mergedData = grades.map((grade) => {
        const found = allExamsData.find((item) => item.gradeID === String(grade.id));
        return {
            gradeID: grade.id,
            sign: grade.sign,
            category: grade.category,
            exams: found ? found.exams : [],
        };
    });

    const filteredGrades = mergedData.filter(
        (g) => g.category?.toLowerCase() === selectedCategory?.toLowerCase()
    );

    useEffect(() => {
        if (selectedGradeId) fetchSelectedExam();
    }, [selectedGradeId]);

    const fetchSelectedExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getExamsByGradeId, {
                params: { gradeId: selectedGradeId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedExam(res.data.exams || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenExam = (row) => {
        setSelectedGradeId(row.gradeID);
        setSelectedGradeSign(row.sign);
        setSelectedGradeCategory(row.category);
        setExam('');
        setOpenExamPopup(true);
    };

    const handleCloseExam = () => {
        setOpenExamPopup(false);
        setExam('');
    };

    const handleExamChange = (e) => {
        const value = e.target.value;
        if (/^[A-Za-z0-9 ]*$/.test(value)) setExam(value);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(
                updateExamsByGradeId,
                { gradeID: String(selectedGradeId), exams: selectedExam },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpen(true); setColor(true); setStatus(true);
            setMessage("Updated successfully");
            setOpenExamPopup(false);
            fetchAllExam();
        } catch (error) {
            setMessage(error.response?.data?.message || "An unexpected error occurred.");
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const c = CATEGORY_COLORS[selectedGradeCategory] || CATEGORY_COLORS['Nursery'];

    return (
        <Box sx={{ width: '100%' }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Header */}
            <Box sx={{ backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd' }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ width: 27, height: 27 }} onClick={() => navigate(-1)}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px' }}>Exam Management</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2 }}>
                {/* Category filter chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                    {CATEGORIES.map((cat) => {
                        const cc = CATEGORY_COLORS[cat];
                        const active = selectedCategory === cat;
                        return (
                            <Chip
                                key={cat}
                                label={cat}
                                onClick={() => setSelectedCategory(cat)}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    bgcolor: active ? cc.color : '#f5f5f5',
                                    color: active ? '#fff' : '#555',
                                    border: `1px solid ${active ? cc.color : '#e0e0e0'}`,
                                    '&:hover': { bgcolor: active ? cc.color : cc.bg, color: active ? '#fff' : cc.color },
                                    transition: '0.2s',
                                }}
                            />
                        );
                    })}
                </Box>

                {/* Class cards */}
                {filteredGrades.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: '#aaa' }}>
                        <ArticleIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography sx={{ fontSize: '15px' }}>
                            No classes found for <strong>{selectedCategory}</strong>.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {filteredGrades.map((grade) => {
                            const cc = CATEGORY_COLORS[grade.category] || CATEGORY_COLORS['Nursery'];
                            return (
                                <Grid key={grade.gradeID} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Box
                                        sx={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            bgcolor: '#fff',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            transition: '0.2s',
                                            '&:hover': { boxShadow: '0 3px 10px rgba(0,0,0,0.1)' },
                                        }}
                                    >
                                        {/* Card header */}
                                        <Box sx={{ bgcolor: cc.bg, px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e8' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cc.color }} />
                                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>
                                                    {grade.sign}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={grade.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: cc.chipBg,
                                                    color: cc.color,
                                                    fontWeight: 600,
                                                    fontSize: '11px',
                                                    border: `1px solid ${cc.color}33`,
                                                }}
                                            />
                                        </Box>

                                        {/* Exams */}
                                        <Box sx={{ px: 2, py: 1.5, minHeight: '80px' }}>
                                            <Typography sx={{ fontSize: '11px', color: '#888', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Exams ({grade.exams?.length || 0})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                                {(grade.exams || []).map((ex, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={ex}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f5f5f5',
                                                            color: '#333',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            height: '24px',
                                                        }}
                                                    />
                                                ))}
                                                {(!grade.exams || grade.exams.length === 0) && (
                                                    <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                                                        No exams yet
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Divider />

                                        {/* Edit button */}
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon sx={{ fontSize: '14px' }} />}
                                                onClick={() => handleOpenExam(grade)}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '12px',
                                                    color: cc.color,
                                                    fontWeight: 600,
                                                    borderRadius: '20px',
                                                    px: 1.5,
                                                    '&:hover': { bgcolor: cc.bg },
                                                }}
                                            >
                                                Edit Exams
                                            </Button>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

            {/* Edit Exams Dialog */}
            <Dialog open={openExamPopup} onClose={handleCloseExam} fullWidth maxWidth="sm">
                <Box sx={{ bgcolor: '#f2f2f2', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Edit Exams</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>
                            Class: <strong>{selectedGradeSign}</strong>
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleCloseExam}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ pt: 2, pb: 1 }}>
                    {/* Existing exams as chips */}
                    {Array.isArray(selectedExam) && selectedExam.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '11px', color: '#888', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Current Exams ({selectedExam.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, p: 1.5, border: '1px solid #e8e8e8', borderRadius: '8px', bgcolor: '#fafafa', minHeight: '48px' }}>
                                {selectedExam.map((ex, idx) => (
                                    <Chip
                                        key={idx}
                                        label={ex}
                                        size="small"
                                        onDelete={() => setSelectedExam(selectedExam.filter((_, i) => i !== idx))}
                                        deleteIcon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
                                        sx={{
                                            bgcolor: c.chipBg || '#f0f0f0',
                                            color: c.color || '#333',
                                            fontWeight: 600,
                                            fontSize: '12px',
                                            height: '26px',
                                            border: `1px solid ${c.color || '#ccc'}33`,
                                            '& .MuiChip-deleteIcon': { color: '#999', '&:hover': { color: '#e53935' } },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {Array.isArray(selectedExam) && selectedExam.length === 0 && (
                        <Box sx={{ mb: 2, p: 2, border: '1px dashed #ddd', borderRadius: '8px', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '13px', color: '#bbb', fontStyle: 'italic' }}>No exams added yet</Typography>
                        </Box>
                    )}

                    {/* Add new exam */}
                    <Typography sx={{ fontSize: '12px', mb: 0.5, color: '#555' }}>Add New Exam</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. Unit Test 1, Mid Term, Final Exam"
                            value={exam}
                            onChange={handleExamChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && exam.trim()) {
                                    setSelectedExam([...selectedExam, exam.trim()]);
                                    setExam('');
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            disabled={!exam.trim()}
                            onClick={() => {
                                if (exam.trim()) {
                                    setSelectedExam([...selectedExam, exam.trim()]);
                                    setExam('');
                                }
                            }}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: c.color || websiteSettings.mainColor,
                                '&:hover': { bgcolor: c.color || websiteSettings.mainColor, opacity: 0.9 },
                                whiteSpace: 'nowrap',
                                minWidth: '70px',
                            }}
                        >
                            Add
                        </Button>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, pb: 2, pt: 1 }}>
                    <Button
                        onClick={() => { fetchSelectedExam(); setExam(''); }}
                        sx={{ textTransform: 'none', color: '#555', borderRadius: '20px', border: '1px solid #ddd' }}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '20px',
                            bgcolor: websiteSettings.mainColor,
                            '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                            px: 3,
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
