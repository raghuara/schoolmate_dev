import { Box, Grid, IconButton, Typography, Chip, Divider, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../../Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import axios from 'axios';
import { fetchAllSubjects } from '../../../Api/Api';
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import SnackBar from '../../SnackBar';

const CATEGORIES = ['Nursery', 'Primary', 'Secondary', 'Higher Secondary'];

const CATEGORY_COLORS = {
    'Nursery':          { color: '#E91E8C', bg: '#FDE8F4', chipBg: '#FCE4F2' },
    'Primary':          { color: '#1976D2', bg: '#E3F2FD', chipBg: '#DBEFFE' },
    'Secondary':        { color: '#388E3C', bg: '#E8F5E9', chipBg: '#D9F0DB' },
    'Higher Secondary': { color: '#F57C00', bg: '#FFF3E0', chipBg: '#FFE9C8' },
};

export default function SubjectMangementPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const userType = user.userType;
    const token = "123";
    const grades = useSelector(selectGrades);

    const [allExamsData, setAllExamsData] = useState([]);
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
            const res = await axios.get(fetchAllSubjects, {
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

    // Merge grades with fetched subject data
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

    return (
        <Box sx={{ width: '100%' }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Header */}
            <Box sx={{ backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd' }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ width: 27, height: 27 }} onClick={() => navigate(-1)}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px' }}>Subject Management</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon sx={{ color: '#fff', fontSize: '20px' }} />}
                            onClick={() => navigate('create')}
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#000',
                                '&:hover': { bgcolor: '#222' },
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                px: 2,
                                py: 0.5,
                            }}
                        >
                            Add Subjects
                        </Button>
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

                                        {/* Exams & subjects */}
                                        <Box sx={{ px: 2, py: 1.5, minHeight: '90px' }}>
                                            {grade.exams && grade.exams.length > 0 ? (
                                                grade.exams.map((examItem, eIdx) => (
                                                    <Box key={eIdx} sx={{ mb: eIdx < grade.exams.length - 1 ? 1.5 : 0 }}>
                                                        <Typography sx={{
                                                            fontSize: '11px', fontWeight: 700, color: cc.color,
                                                            mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px',
                                                        }}>
                                                            {examItem.exam}
                                                        </Typography>

                                                        {/* Primary subjects */}
                                                        {examItem.primarySubjects?.length > 0 && (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                                                                {examItem.primarySubjects.map((sub, si) => (
                                                                    <Chip key={si} label={sub} size="small"
                                                                        sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontSize: '11px', fontWeight: 600, height: '22px' }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        )}

                                                        {/* Secondary subjects */}
                                                        {examItem.secondarySubjects?.length > 0 && (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {examItem.secondarySubjects.map((sub, si) => (
                                                                    <Chip key={si} label={sub} size="small"
                                                                        sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontSize: '11px', fontWeight: 600, height: '22px' }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        )}

                                                        {(!examItem.primarySubjects?.length && !examItem.secondarySubjects?.length) && (
                                                            <Typography sx={{ fontSize: '11px', color: '#bbb', fontStyle: 'italic' }}>
                                                                No subjects yet
                                                            </Typography>
                                                        )}

                                                        {eIdx < grade.exams.length - 1 && <Divider sx={{ mt: 1 }} />}
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                                                    No subjects yet
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>
        </Box>
    );
}
