import React, { useState } from 'react';
import {
    Box, Grid, IconButton, Typography, Button, Autocomplete,
    TextField, Dialog, DialogContent, DialogActions, Chip,
    Divider, InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ClassIcon from '@mui/icons-material/Class';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { selectGrades, fetchGradesData } from '../../../Redux/Slices/DropdownController';
import axios from 'axios';
import Loader from '../../Loader';
import SnackBar from '../../SnackBar';
import { postGrade, postSection } from '../../../Api/Api';

const CATEGORIES = ['Nursery', 'Primary', 'Secondary', 'Higher Secondary'];

const CATEGORY_COLORS = {
    'Nursery':          { color: '#E91E8C', bg: '#FDE8F4', chipBg: '#FCE4F2' },
    'Primary':          { color: '#1976D2', bg: '#E3F2FD', chipBg: '#DBEFFE' },
    'Secondary':        { color: '#388E3C', bg: '#E8F5E9', chipBg: '#D9F0DB' },
    'Higher Secondary': { color: '#F57C00', bg: '#FFF3E0', chipBg: '#FFE9C8' },
};

export default function ClassSectionManagementPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const grades = useSelector(selectGrades);
    const token = localStorage.getItem('token') || '123';

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    // Category filter
    const [selectedCategory, setSelectedCategory] = useState('Nursery');

    // Create Class dialog
    const [openClassDialog, setOpenClassDialog] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newClassCategory, setNewClassCategory] = useState('');

    // Add Section dialog
    const [openSectionDialog, setOpenSectionDialog] = useState(false);
    const [sectionTargetGrade, setSectionTargetGrade] = useState(null);
    const [newSectionName, setNewSectionName] = useState('');

    const filteredGrades = grades.filter(
        (g) => g.category?.toLowerCase() === selectedCategory?.toLowerCase()
    );

    const showSnack = (msg, success) => {
        setMessage(msg);
        setOpen(true);
        setColor(success);
        setStatus(success);
    };
    
    // ── Create Class ──────────────────────────────────────────────
    const handleOpenClassDialog = () => {
        setNewClassName('');
        setNewClassCategory(selectedCategory || '');
        setOpenClassDialog(true);
    };

    const handleCreateClass = async () => {
        if (!newClassName.trim()) {
            showSnack('Class name is required', false);
            return;
        }
        if (!newClassCategory) {
            showSnack('Category is required', false);
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(
                postGrade,
                { sign: newClassName.trim(), category: newClassCategory },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnack('Class created successfully', true);
            setOpenClassDialog(false);
            dispatch(fetchGradesData());
        } catch {
            showSnack('Failed to create class', false);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Add Section ───────────────────────────────────────────────
    const handleOpenSectionDialog = (grade) => {
        setSectionTargetGrade(grade);
        setNewSectionName('');
        setOpenSectionDialog(true);
    };

    const handleAddSection = async () => {
        if (!newSectionName.trim()) {
            showSnack('Section name is required', false);
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(
                postSection,
                { gradeId: sectionTargetGrade.id, section: newSectionName.trim().toUpperCase() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnack('Section added successfully', true);
            setOpenSectionDialog(false);
            dispatch(fetchGradesData());
        } catch {
            showSnack('Failed to add section', false);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ width: '100%' }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{ backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd' }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ width: 27, height: 27 }} onClick={() => navigate(-1)}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px' }}>
                            Class & Section Management
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon sx={{ color: '#fff', fontSize: '20px' }} />}
                            onClick={handleOpenClassDialog}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '20px',
                                color:"#fff",
                                backgroundColor:"#000",
                                fontSize: '13px',
                            }}
                        >
                            Create Class
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2 }}>
                {/* Category filter */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                    {CATEGORIES.map((cat) => {
                        const c = CATEGORY_COLORS[cat];
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
                                    bgcolor: active ? c.color : '#f5f5f5',
                                    color: active ? '#fff' : '#555',
                                    border: `1px solid ${active ? c.color : '#e0e0e0'}`,
                                    '&:hover': { bgcolor: active ? c.color : c.bg, color: active ? '#fff' : c.color },
                                    transition: '0.2s',
                                }}
                            />
                        );
                    })}
                </Box>

                {/* Class cards */}
                {filteredGrades.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: '#aaa' }}>
                        <ClassIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography sx={{ fontSize: '15px' }}>
                            No classes found for <strong>{selectedCategory}</strong>. Create one to get started.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {filteredGrades.map((grade) => {
                            const c = CATEGORY_COLORS[grade.category] || CATEGORY_COLORS['Nursery'];
                            return (
                                <Grid key={grade.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                                        <Box sx={{ bgcolor: c.bg, px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e8' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>
                                                    {grade.sign}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={grade.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: c.chipBg,
                                                    color: c.color,
                                                    fontWeight: 600,
                                                    fontSize: '11px',
                                                    border: `1px solid ${c.color}33`,
                                                }}
                                            />
                                        </Box>

                                        {/* Sections */}
                                        <Box sx={{ px: 2, py: 1.5, minHeight: '80px' }}>
                                            <Typography sx={{ fontSize: '11px', color: '#555', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Sections ({grade.sections?.length || 0})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                                {(grade.sections || []).map((sec) => (
                                                    <Chip
                                                        key={sec}
                                                        label={sec}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f5f5f5',
                                                            color: '#333',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            height: '24px',
                                                            minWidth:"50px",
                                                            border:"1px solid #ccc"
                                                        }}
                                                    />
                                                ))}
                                                {(!grade.sections || grade.sections.length === 0) && (
                                                    <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                                                        No sections yet
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Divider />

                                        {/* Add section button */}
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Button
                                                size="small"
                                                startIcon={<AddIcon sx={{ fontSize: '14px' }} />}
                                                onClick={() => handleOpenSectionDialog(grade)}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '12px',
                                                    color: c.color,
                                                    fontWeight: 600,
                                                    borderRadius: '20px',
                                                    px: 1.5,
                                                    '&:hover': { bgcolor: c.bg },
                                                }}
                                            >
                                                Add Section
                                            </Button>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

            {/* ── Create Class Dialog ─────────────────────────── */}
            <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)} fullWidth maxWidth="xs">
                <Box sx={{ bgcolor: '#f2f2f2', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Create New Class</Typography>
                    <IconButton size="small" onClick={() => setOpenClassDialog(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                    <Typography sx={{ fontSize: '12px', mb: 0.5, color: '#555' }}>
                        Category<span style={{ color: '#f00', fontSize: 16 }}>*</span>
                    </Typography>
                    <Autocomplete
                        options={CATEGORIES}
                        value={newClassCategory}
                        onChange={(_, v) => setNewClassCategory(v || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder="Select category"
                                sx={{ mb: 2, '& .MuiInputBase-root': { fontSize: 14 } }}
                            />
                        )}
                    />
                    <Typography sx={{ fontSize: '12px', mb: 0.5, color: '#555' }}>
                        Class Name<span style={{ color: '#f00', fontSize: 16 }}>*</span>
                    </Typography>
                    <Autocomplete
                        options={['PREKG', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']}
                        value={newClassName}
                        onChange={(_, v) => setNewClassName(v || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder="Select class"
                                sx={{ '& .MuiInputBase-root': { fontSize: 14 } }}
                            />
                        )}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setOpenClassDialog(false)} sx={{ textTransform: 'none', color: '#555', borderRadius: '20px' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateClass}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '20px',
                            bgcolor: websiteSettings.mainColor,
                            '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                        }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Add Section Dialog ──────────────────────────── */}
            <Dialog open={openSectionDialog} onClose={() => setOpenSectionDialog(false)} fullWidth maxWidth="xs">
                <Box sx={{ bgcolor: '#f2f2f2', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Add Section</Typography>
                        {sectionTargetGrade && (
                            <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                Class: <strong>{sectionTargetGrade.sign}</strong>
                            </Typography>
                        )}
                    </Box>
                    <IconButton size="small" onClick={() => setOpenSectionDialog(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                    <Typography sx={{ fontSize: '12px', mb: 0.5, color: '#555' }}>
                        Section Name<span style={{ color: '#f00', fontSize: 16 }}>*</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. A, B, A1, V"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value.slice(0, 10))}
                        inputProps={{ maxLength: 10 }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection(); }}
                    />
                    {sectionTargetGrade?.sections?.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                            <Typography sx={{ fontSize: '11px', color: '#888', mb: 0.7 }}>Existing sections:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {sectionTargetGrade.sections.map((s) => (
                                    <Chip key={s} label={s} size="small" sx={{ fontSize: '11px', bgcolor: '#f0f0f0' }} />
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setOpenSectionDialog(false)} sx={{ textTransform: 'none', color: '#555', borderRadius: '20px' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddSection}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '20px',
                            bgcolor: websiteSettings.mainColor,
                            '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                        }}
                    >
                        Add Section
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
