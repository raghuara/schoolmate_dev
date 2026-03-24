import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Dialog, Typography, TextField, Chip, Grid,
    IconButton, Divider, InputAdornment, List, ListItemButton, Avatar,
} from '@mui/material';
import { Stack } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';

const MAIN_COLOR = '#9C27B0';
const MAIN_LIGHT = '#F3E5F5';

export default function AdditionalStudentSelectionPopup({
    open,
    onClose,
    users = [],
    onSave,
    existingStudents = [],
    activity = null,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRolls, setSelectedRolls] = useState([]);

    useEffect(() => {
        if (open) {
            setSelectedRolls(existingStudents);
            setSearchQuery('');
        }
    }, [open, existingStudents]);

    // Enable save only when selection has actually changed from the original
    const hasChanges = useMemo(() => {
        const a = [...selectedRolls].sort().join(',');
        const b = [...existingStudents].sort().join(',');
        return a !== b;
    }, [selectedRolls, existingStudents]);

    const existingSet = useMemo(() => new Set(existingStudents), [existingStudents]);

    const filteredUsers = users.filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return u.rollNumber?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
    });

    const addStudent = (student) => {
        if (!selectedRolls.includes(student.rollNumber)) {
            setSelectedRolls((prev) => [...prev, student.rollNumber]);
        }
    };

    const removeStudent = (rollNumber) => {
        setSelectedRolls((prev) => prev.filter((r) => r !== rollNumber));
    };

    const getStudentInfo = (rollNumber) => {
        const found = users.find((u) => u.rollNumber === rollNumber);
        return found || { name: rollNumber, rollNumber, grade: '', section: '' };
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedRolls([]);
        onClose();
    };

    const newlyAddedCount = selectedRolls.filter(r => !existingSet.has(r)).length;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                px: 3, py: 2,
                backgroundColor: MAIN_COLOR,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <AddBoxIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            Add Students to Additional Fee
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', mt: 0.3 }}>
                            {activity?.feeName || 'Search and select students'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Scrollable body */}
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <Grid container spacing={2}>
                    {/* Left: All students list */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{
                                px: 2, py: 1.2,
                                backgroundColor: MAIN_LIGHT,
                                borderBottom: '1px solid #E5E7EB',
                                display: 'flex', alignItems: 'center', gap: 1,
                            }}>
                                <SearchIcon sx={{ fontSize: 16, color: MAIN_COLOR }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: MAIN_COLOR }}>
                                    All Students ({users.length})
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: '#fff' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search by name or roll number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
                                />
                                <Box sx={{
                                    maxHeight: 280, overflowY: 'auto',
                                    '&::-webkit-scrollbar': { width: '4px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' },
                                }}>
                                    {filteredUsers.length === 0 ? (
                                        <Box sx={{ py: 5, textAlign: 'center' }}>
                                            <PeopleAltIcon sx={{ fontSize: 38, color: '#D1D5DB', mb: 1 }} />
                                            <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                                                {searchQuery ? 'No students match your search' : 'No students available'}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <List dense disablePadding>
                                            {filteredUsers.map((student) => {
                                                const isSelected = selectedRolls.includes(student.rollNumber);
                                                const isExisting = existingSet.has(student.rollNumber);
                                                return (
                                                    <ListItemButton
                                                        key={student.rollNumber}
                                                        onClick={() => !isSelected && addStudent(student)}
                                                        sx={{
                                                            borderRadius: '8px', mb: 0.5, px: 1.5, py: 0.8,
                                                            border: '1px solid',
                                                            borderColor: isSelected ? '#E1BEE7' : '#F3F4F6',
                                                            backgroundColor: isSelected ? MAIN_LIGHT : '#FAFAFA',
                                                            cursor: isSelected ? 'default' : 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: isSelected ? MAIN_LIGHT : '#F9F0FF',
                                                                borderColor: isSelected ? '#E1BEE7' : `${MAIN_COLOR}50`,
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                            <Avatar sx={{
                                                                width: 28, height: 28, fontSize: 12, flexShrink: 0,
                                                                bgcolor: isSelected ? MAIN_COLOR : '#9E9E9E',
                                                            }}>
                                                                {student.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography sx={{
                                                                    fontSize: 13, fontWeight: 600,
                                                                    color: isSelected ? MAIN_COLOR : '#1F2937',
                                                                    lineHeight: 1.2,
                                                                }} noWrap>
                                                                    {student.name}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                                                                    {student.rollNumber} · {student.grade} / {student.section}
                                                                </Typography>
                                                            </Box>
                                                            {isSelected && (
                                                                isExisting
                                                                    ? <CheckCircleIcon sx={{ fontSize: 16, color: MAIN_COLOR, flexShrink: 0 }} />
                                                                    : <CheckCircleOutlineIcon sx={{ fontSize: 16, color: MAIN_COLOR, flexShrink: 0 }} />
                                                            )}
                                                        </Box>
                                                    </ListItemButton>
                                                );
                                            })}
                                        </List>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right: Selected students */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{
                                px: 2, py: 1.2,
                                backgroundColor: MAIN_LIGHT,
                                borderBottom: '1px solid #E5E7EB',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: MAIN_COLOR }} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: MAIN_COLOR }}>
                                        Selected Students
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    {newlyAddedCount > 0 && (
                                        <Chip
                                            label={`+${newlyAddedCount} new`}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#fff', color: MAIN_COLOR,
                                                fontWeight: 700, fontSize: 10, height: 20,
                                                border: `1px solid ${MAIN_COLOR}40`,
                                            }}
                                        />
                                    )}
                                    <Box sx={{
                                        backgroundColor: selectedRolls.length > 0 ? MAIN_COLOR : '#D1D5DB',
                                        borderRadius: '20px', px: 1.2, py: 0.1, minWidth: 24, textAlign: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                                            {selectedRolls.length}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{
                                p: 2, backgroundColor: '#fff',
                                minHeight: '280px', maxHeight: '280px',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { backgroundColor: '#F3F4F6', borderRadius: '10px' },
                                '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' },
                            }}>
                                {selectedRolls.length === 0 ? (
                                    <Box sx={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        height: '240px', gap: 1,
                                    }}>
                                        <PeopleAltIcon sx={{ fontSize: 38, color: '#D1D5DB' }} />
                                        <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>No students selected yet</Typography>
                                        <Typography sx={{ fontSize: 12, color: '#D1D5DB' }}>Search and click students on the left</Typography>
                                    </Box>
                                ) : (
                                    <Stack direction="row" flexWrap="wrap" sx={{ columnGap: 1, rowGap: 1 }}>
                                        {selectedRolls.map((rollNumber) => {
                                            const info = getStudentInfo(rollNumber);
                                            const isSaved = existingSet.has(rollNumber);
                                            return (
                                                <Chip
                                                    key={rollNumber}
                                                    label={
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                                                <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                                                                    {info.name}
                                                                </Typography>
                                                                {isSaved && (
                                                                    <CheckCircleIcon sx={{ fontSize: 11, color: MAIN_COLOR }} />
                                                                )}
                                                            </Box>
                                                            <Typography sx={{ fontSize: 10, color: `${MAIN_COLOR}99`, lineHeight: 1.2 }}>
                                                                {rollNumber}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    onDelete={() => removeStudent(rollNumber)}
                                                    sx={{
                                                        height: 'auto', py: 0.5,
                                                        backgroundColor: isSaved ? '#F3E5F5' : '#FAF0FF',
                                                        color: MAIN_COLOR,
                                                        border: `1px solid ${isSaved ? '#CE93D8' : `${MAIN_COLOR}30`}`,
                                                        '& .MuiChip-deleteIcon': { color: `${MAIN_COLOR}70`, fontSize: '15px' },
                                                        '&:hover': { backgroundColor: '#E1BEE7' },
                                                        '&:hover .MuiChip-deleteIcon': { color: '#dc2626' },
                                                    }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Footer — always visible */}
            <Box sx={{ px: 3, pb: 2.5, pt: 0, flexShrink: 0, backgroundColor: '#fff' }}>
                <Divider sx={{ mb: 2, borderColor: '#E5E7EB' }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        sx={{
                            textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600,
                            color: '#6B7280', borderColor: '#D1D5DB', backgroundColor: '#fff',
                            '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' },
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="outlined"
                        disabled={selectedRolls.length === 0}
                        onClick={() => setSelectedRolls([])}
                        sx={{
                            textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600,
                            color: '#6B7280', borderColor: '#D1D5DB',
                            '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
                            '&:disabled': { opacity: 0.4 },
                        }}
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!hasChanges}
                        onClick={() => {
                            onSave?.(selectedRolls);
                            onClose();
                        }}
                        sx={{
                            textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600,
                            backgroundColor: MAIN_COLOR, color: '#fff', boxShadow: 'none',
                            '&:hover': { backgroundColor: '#7B1FA2', boxShadow: 'none' },
                            '&:disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF' },
                        }}
                    >
                        Save Students ({selectedRolls.length})
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
