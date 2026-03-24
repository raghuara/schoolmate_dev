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

const ECA_COLOR = '#3457D5';
const ECA_LIGHT = '#EEF1FD';

export default function EcaStudentSelectionPopup({ open, onClose, users = [], onSave, existingStudents = [], activity = null }) {
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

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}
        >
            {/* Header */}
            <Box sx={{ px: 3, py: 2, backgroundColor: ECA_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PeopleAltIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            Add Students to Activity
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', mt: 0.3 }}>
                            {activity ? `${activity.activityCategory} - ${activity.activityName}` : 'Search and select eligible students'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <Grid container spacing={2}>
                    {/* Left: Eligible student list */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ px: 2, py: 1.2, backgroundColor: ECA_LIGHT, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SearchIcon sx={{ fontSize: 16, color: ECA_COLOR }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: ECA_COLOR }}>
                                    Eligible Students ({users.length})
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
                                <Box sx={{ maxHeight: 280, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' } }}>
                                    {filteredUsers.length === 0 ? (
                                        <Box sx={{ py: 4, textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>No students found</Typography>
                                        </Box>
                                    ) : (
                                        <List dense disablePadding>
                                            {filteredUsers.map((student) => {
                                                const isSelected = selectedRolls.includes(student.rollNumber);
                                                return (
                                                    <ListItemButton
                                                        key={student.rollNumber}
                                                        onClick={() => !isSelected && addStudent(student)}
                                                        sx={{
                                                            borderRadius: '8px', mb: 0.5, px: 1.5, py: 0.8,
                                                            border: '1px solid',
                                                            borderColor: isSelected ? '#BBF7D0' : '#F3F4F6',
                                                            backgroundColor: isSelected ? '#F0FDF4' : '#FAFAFA',
                                                            cursor: isSelected ? 'default' : 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: isSelected ? '#F0FDF4' : ECA_LIGHT,
                                                                borderColor: isSelected ? '#BBF7D0' : ECA_COLOR + '50',
                                                            },
                                                            '&.Mui-disabled': { opacity: 1 },
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: isSelected ? '#16a34a' : ECA_COLOR }}>
                                                                {student.name?.charAt(0) || '?'}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#15803D' : '#1F2937', lineHeight: 1.2 }}>
                                                                    {student.name}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                                                                    {student.rollNumber} · {student.grade} / {student.section}
                                                                </Typography>
                                                            </Box>
                                                            {isSelected && <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a', flexShrink: 0 }} />}
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
                            <Box sx={{ px: 2, py: 1.2, backgroundColor: '#F0FDF4', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Selected Students</Typography>
                                </Box>
                                <Box sx={{ backgroundColor: selectedRolls.length > 0 ? '#16a34a' : '#D1D5DB', color: '#fff', borderRadius: '20px', px: 1.2, py: 0.1, minWidth: 24, textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{selectedRolls.length}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: '#fff', minHeight: '340px', maxHeight: '340px', overflowY: 'auto', '&::-webkit-scrollbar': { width: '5px' }, '&::-webkit-scrollbar-track': { backgroundColor: '#F3F4F6', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' } }}>
                                {selectedRolls.length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: 1 }}>
                                        <PeopleAltIcon sx={{ fontSize: 36, color: '#D1D5DB' }} />
                                        <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>No students selected yet</Typography>
                                        <Typography sx={{ fontSize: 12, color: '#D1D5DB' }}>Search and click students on the left</Typography>
                                    </Box>
                                ) : (
                                    <Stack direction="row" flexWrap="wrap" sx={{ columnGap: 1, rowGap: 1 }}>
                                        {selectedRolls.map((rollNumber) => {
                                            const info = getStudentInfo(rollNumber);
                                            return (
                                                <Chip
                                                    key={rollNumber}
                                                    label={
                                                        <Box>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{info.name}</Typography>
                                                            <Typography sx={{ fontSize: 10, color: ECA_COLOR + '99', lineHeight: 1.2 }}>{rollNumber}</Typography>
                                                        </Box>
                                                    }
                                                    onDelete={() => removeStudent(rollNumber)}
                                                    sx={{
                                                        height: 'auto', py: 0.5, fontSize: '12px', fontWeight: 600,
                                                        backgroundColor: ECA_LIGHT, color: ECA_COLOR,
                                                        border: `1px solid ${ECA_COLOR}30`,
                                                        '& .MuiChip-deleteIcon': { color: `${ECA_COLOR}80`, fontSize: '15px' },
                                                        '&:hover': { backgroundColor: '#dce3fa' },
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
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600, color: '#6B7280', borderColor: '#D1D5DB', backgroundColor: '#fff', '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' } }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="outlined"
                        disabled={selectedRolls.length === 0}
                        onClick={() => setSelectedRolls([])}
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600, color: '#6B7280', borderColor: '#D1D5DB', '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' }, '&:disabled': { opacity: 0.4 } }}
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
                            backgroundColor: ECA_COLOR, color: '#fff', boxShadow: 'none',
                            '&:hover': { backgroundColor: '#2a46b8', boxShadow: 'none' },
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
