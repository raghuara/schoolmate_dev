import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Dialog, Typography, TextField, Chip, Grid,
    IconButton, Divider, InputAdornment, List, ListItemButton, Avatar,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
} from '@mui/material';
import { Stack } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { getEligibleTransportStudents } from '../../Api/Api';

const MAIN_COLOR = '#3457D5';
const MAIN_LIGHT = '#EEF1FD';

export default function StudentSelectionPopup({ open, onClose, onSave, activity = null, year = '', token = '' }) {
    const [selectedBusStop, setSelectedBusStop] = useState(null);
    const [eligibleStudents, setEligibleStudents] = useState([]);
    // Roll numbers already saved to this stop (from routeStops data)
    const [existingRolls, setExistingRolls] = useState(new Set());
    // Details map for already-saved students (for chip name/grade display)
    const [existingStudentMap, setExistingStudentMap] = useState({});
    // All currently selected rolls (existing + newly added in this session)
    const [selectedRolls, setSelectedRolls] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedBusStop(null);
            setEligibleStudents([]);
            setExistingRolls(new Set());
            setExistingStudentMap({});
            setSelectedRolls([]);
            setSearchQuery('');
        }
    }, [open]);

    const fetchEligibleStudents = async (stop) => {
        if (!activity?.routeInformationId || !stop) return;
        setLoading(true);
        try {
            const res = await axios.get(getEligibleTransportStudents, {
                params: {
                    RouteInformationId: activity.routeInformationId,
                    BusStop: stop.place,
                    Year: year,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            let students = [];
            if (Array.isArray(res.data)) {
                students = res.data.flatMap(g => g.students || []);
            } else if (Array.isArray(res.data?.data)) {
                students = res.data.data.flatMap(g => g.students || []);
            } else if (res.data?.students) {
                students = res.data.students;
            }
            setEligibleStudents(students);
        } catch (err) {
            console.error('Failed to fetch eligible students:', err);
            setEligibleStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBusStopChange = (stopPoint) => {
        const stop = activity?.routeStops?.find(s => s.point === stopPoint);
        if (!stop) {
            setSelectedBusStop(null);
            setExistingRolls(new Set());
            setExistingStudentMap({});
            setSelectedRolls([]);
            setEligibleStudents([]);
            setSearchQuery('');
            return;
        }

        // Build existing students data from stop.students
        const existing = stop.students || [];
        const existingRollNumbers = existing.map(s => s.rollNumber).filter(Boolean);
        const detailsMap = {};
        existing.forEach(s => {
            if (s.rollNumber) detailsMap[s.rollNumber] = s;
        });

        setSelectedBusStop(stop);
        setExistingRolls(new Set(existingRollNumbers));
        setExistingStudentMap(detailsMap);
        setSelectedRolls(existingRollNumbers);   // pre-populate with existing
        setEligibleStudents([]);
        setSearchQuery('');
        fetchEligibleStudents(stop);
    };

    // Resolve student name/details — check eligible list first, then existing map
    const getStudentInfo = (rollNumber) => {
        const fromEligible = eligibleStudents.find(u => u.rollNumber === rollNumber);
        if (fromEligible) return fromEligible;
        const fromExisting = existingStudentMap[rollNumber];
        if (fromExisting) return fromExisting;
        return { name: rollNumber, rollNumber, grade: '', section: '' };
    };

    const filteredStudents = eligibleStudents.filter(u => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return u.rollNumber?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
    });

    const addStudent = (student) => {
        if (!selectedRolls.includes(student.rollNumber)) {
            setSelectedRolls(prev => [...prev, student.rollNumber]);
        }
    };

    const removeStudent = (rollNumber) => {
        setSelectedRolls(prev => prev.filter(r => r !== rollNumber));
    };

    const handleClose = () => {
        setSelectedBusStop(null);
        setEligibleStudents([]);
        setExistingRolls(new Set());
        setExistingStudentMap({});
        setSelectedRolls([]);
        setSearchQuery('');
        onClose();
    };

    const handleSave = () => {
        const payload = {
            selectedStudents: selectedRolls,
            busStop: selectedBusStop.place,
            busStopPoint: selectedBusStop.point,
            busStopDetails: selectedBusStop,
        };
        onSave?.(payload);
        onClose();
    };

    // Enable save only when selection has actually changed from the stop's saved state
    const hasChanges = useMemo(() => {
        const a = [...selectedRolls].sort().join(',');
        const b = [...existingRolls].sort().join(',');
        return a !== b;
    }, [selectedRolls, existingRolls]);

    // Counts for header badge
    const newlyAddedCount = selectedRolls.filter(r => !existingRolls.has(r)).length;

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
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }}
        >
            {/* Header — fixed, never scrolls */}
            <Box sx={{ px: 3, py: 2, backgroundColor: MAIN_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DirectionsBusIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            Map Students to Route
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', mt: 0.3 }}>
                            {activity?.routeInformation?.tripName || activity?.routeName || 'Select a bus stop to view eligible students'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Scrollable body */}
            <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>

                {/* Bus Stop Selector */}
                {activity?.routeStops?.length > 0 && (
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', mb: 2 }}>
                        <Box sx={{
                            px: 2, py: 1.2,
                            backgroundColor: selectedBusStop ? MAIN_LIGHT : '#F9FAFB',
                            borderBottom: '1px solid #E5E7EB',
                            display: 'flex', alignItems: 'center', gap: 1,
                        }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: selectedBusStop ? MAIN_COLOR : '#9CA3AF' }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: selectedBusStop ? MAIN_COLOR : '#6B7280' }}>
                                Select Bus Stop
                            </Typography>
                            {selectedBusStop && (
                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {existingRolls.size > 0 && (
                                        <Chip
                                            label={`${existingRolls.size} already mapped`}
                                            size="small"
                                            sx={{ backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: 11, height: 22, border: '1px solid #FDE68A' }}
                                        />
                                    )}
                                    <Chip
                                        label="Selected"
                                        size="small"
                                        sx={{ backgroundColor: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 11, height: 22 }}
                                    />
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ p: 2, backgroundColor: '#fff' }}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ fontSize: 13, '&.Mui-focused': { color: MAIN_COLOR } }}>
                                    Choose a bus stop from the route *
                                </InputLabel>
                                <Select
                                    value={selectedBusStop?.point || ''}
                                    onChange={(e) => handleBusStopChange(e.target.value)}
                                    label="Choose a bus stop from the route *"
                                    sx={{
                                        fontSize: '14px',
                                        backgroundColor: '#FAFAFA',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: selectedBusStop ? MAIN_COLOR : '#D1D5DB' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: MAIN_COLOR },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: MAIN_COLOR },
                                    }}
                                    renderValue={() => selectedBusStop ? `${selectedBusStop.point} - ${selectedBusStop.place}` : ''}
                                >
                                    {activity.routeStops.map((stop, index) => {
                                        const mappedCount = (stop.students || []).length;
                                        return (
                                            <MenuItem
                                                key={index}
                                                value={stop.point}
                                                sx={{
                                                    fontSize: '14px', py: 1.2,
                                                    '&:hover': { backgroundColor: MAIN_LIGHT },
                                                    '&.Mui-selected': { backgroundColor: MAIN_LIGHT, '&:hover': { backgroundColor: `${MAIN_COLOR}20` } },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{stop.point}</Typography>
                                                        <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                                                            {stop.place}{stop.arrivalTime ? ` • ${stop.arrivalTime}` : ''}
                                                        </Typography>
                                                    </Box>
                                                    {mappedCount > 0 && (
                                                        <Chip
                                                            label={`${mappedCount} mapped`}
                                                            size="small"
                                                            sx={{ ml: 2, backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 600, fontSize: 10, height: 20 }}
                                                        />
                                                    )}
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                )}

                {/* Student Panels */}
                <Grid container spacing={2}>
                    {/* Left: Eligible Students */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ px: 2, py: 1.2, backgroundColor: MAIN_LIGHT, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SearchIcon sx={{ fontSize: 16, color: MAIN_COLOR }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: MAIN_COLOR }}>
                                    Eligible Students
                                    {selectedBusStop && !loading && eligibleStudents.length > 0
                                        ? ` (${eligibleStudents.length})`
                                        : ''}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: '#fff' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search by name or roll number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={!selectedBusStop || loading}
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
                                <Box sx={{ maxHeight: 240, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' } }}>
                                    {!selectedBusStop ? (
                                        <Box sx={{ py: 5, textAlign: 'center' }}>
                                            <DirectionsBusIcon sx={{ fontSize: 38, color: '#D1D5DB', mb: 1 }} />
                                            <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>Select a bus stop first</Typography>
                                            <Typography sx={{ fontSize: 12, color: '#D1D5DB', mt: 0.5 }}>Eligible students will appear here</Typography>
                                        </Box>
                                    ) : loading ? (
                                        <Box sx={{ py: 5, textAlign: 'center' }}>
                                            <CircularProgress size={26} sx={{ color: MAIN_COLOR }} />
                                            <Typography sx={{ fontSize: 13, color: '#9CA3AF', mt: 1.5 }}>Loading students...</Typography>
                                        </Box>
                                    ) : filteredStudents.length === 0 ? (
                                        <Box sx={{ py: 5, textAlign: 'center' }}>
                                            <PeopleAltIcon sx={{ fontSize: 38, color: '#D1D5DB', mb: 1 }} />
                                            <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                                                {searchQuery ? 'No students match your search' : 'No eligible students for this stop'}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <List dense disablePadding>
                                            {filteredStudents.map((student) => {
                                                const isSelected = selectedRolls.includes(student.rollNumber);
                                                const isExisting = existingRolls.has(student.rollNumber);
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
                                                                backgroundColor: isSelected ? '#F0FDF4' : MAIN_LIGHT,
                                                                borderColor: isSelected ? '#BBF7D0' : `${MAIN_COLOR}50`,
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, flexShrink: 0, bgcolor: isSelected ? '#16a34a' : MAIN_COLOR }}>
                                                                {student.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#15803D' : '#1F2937', lineHeight: 1.2 }} noWrap>
                                                                    {student.name}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                                                                    {student.rollNumber} · {student.grade} / {student.section}
                                                                </Typography>
                                                            </Box>
                                                            {isSelected ? (
                                                                <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a', flexShrink: 0 }} />
                                                            ) : null}
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

                    {/* Right: Selected Students */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ px: 2, py: 1.2, backgroundColor: '#F0FDF4', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Selected Students</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    {newlyAddedCount > 0 && (
                                        <Chip
                                            label={`+${newlyAddedCount} new`}
                                            size="small"
                                            sx={{ backgroundColor: MAIN_LIGHT, color: MAIN_COLOR, fontWeight: 700, fontSize: 10, height: 20, border: `1px solid ${MAIN_COLOR}30` }}
                                        />
                                    )}
                                    <Box sx={{ backgroundColor: selectedRolls.length > 0 ? '#16a34a' : '#D1D5DB', borderRadius: '20px', px: 1.2, py: 0.1, minWidth: 24, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{selectedRolls.length}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{
                                p: 2, backgroundColor: '#fff',
                                minHeight: '260px', maxHeight: '260px',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { backgroundColor: '#F3F4F6', borderRadius: '10px' },
                                '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' },
                            }}>
                                {selectedRolls.length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', gap: 1 }}>
                                        <PeopleAltIcon sx={{ fontSize: 38, color: '#D1D5DB' }} />
                                        <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>No students selected yet</Typography>
                                        <Typography sx={{ fontSize: 12, color: '#D1D5DB' }}>Search and click students on the left</Typography>
                                    </Box>
                                ) : (
                                    <Stack direction="row" flexWrap="wrap" sx={{ columnGap: 1, rowGap: 1 }}>
                                        {selectedRolls.map((rollNumber) => {
                                            const info = getStudentInfo(rollNumber);
                                            const isSaved = existingRolls.has(rollNumber);
                                            return (
                                                <Chip
                                                    key={rollNumber}
                                                    label={
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                                                                    {info.name}
                                                                </Typography>
                                                                {isSaved && (
                                                                    <CheckCircleIcon sx={{ fontSize: 11, color: '#16a34a' }} />
                                                                )}
                                                            </Box>
                                                            <Typography sx={{ fontSize: 10, color: isSaved ? '#15803D99' : `${MAIN_COLOR}99`, lineHeight: 1.2 }}>
                                                                {rollNumber}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    onDelete={() => removeStudent(rollNumber)}
                                                    sx={{
                                                        height: 'auto', py: 0.5,
                                                        backgroundColor: isSaved ? '#DCFCE7' : MAIN_LIGHT,
                                                        color: isSaved ? '#15803D' : MAIN_COLOR,
                                                        border: `1px solid ${isSaved ? '#86EFAC' : `${MAIN_COLOR}30`}`,
                                                        '& .MuiChip-deleteIcon': { color: isSaved ? '#16a34a80' : `${MAIN_COLOR}80`, fontSize: '15px' },
                                                        '&:hover': { backgroundColor: isSaved ? '#BBF7D0' : '#dce3fa' },
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

            {/* Footer — sticky, always visible */}
            <Box sx={{ px: 2, pb: 2, pt: 0, flexShrink: 0, backgroundColor: '#fff' }}>
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
                        onClick={() => setSelectedRolls([])}
                        disabled={selectedRolls.length === 0}
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600, color: '#6B7280', borderColor: '#D1D5DB', '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' }, '&:disabled': { opacity: 0.5 } }}
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!selectedBusStop || !hasChanges}
                        onClick={handleSave}
                        sx={{
                            textTransform: 'none', borderRadius: '8px', px: 3, fontSize: 13, fontWeight: 600,
                            backgroundColor: MAIN_COLOR, color: '#fff', boxShadow: 'none',
                            '&:hover': { backgroundColor: '#2a46b8', boxShadow: 'none' },
                            '&:disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF' },
                        }}
                    >
                        Save Mapping ({selectedRolls.length})
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
