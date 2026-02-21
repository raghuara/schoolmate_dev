import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    Typography,
    Popper,
    Paper,
    List,
    ListItemButton,
    TextareaAutosize,
    Chip,
    Grid,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
} from '@mui/material';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import { Stack } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const MAIN_COLOR = '#3457D5';
const MAIN_LIGHT = '#EEF1FD';

export default function StudentSelectionPopup({ open, onClose, users = [], onSave, value = '', activity = null }) {
    useEffect(() => {
        if (open) {
            setInputText(value);
        }
    }, [open, value]);

    const [inputText, setInputText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBusStop, setSelectedBusStop] = useState(null);
    const textareaRef = useRef();
    const websiteSettings = useSelector(selectWebsiteSettings);

    const getChipValues = (text) =>
        text
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);

    const removeChip = (chipValue) => {
        const updated = getChipValues(inputText)
            .filter(v => v !== chipValue)
            .join(', ');
        setInputText(updated ? updated + ', ' : '');
    };

    const getLastQuery = (value) => {
        const tokens = value.split(',').map(token => token.trim());
        return tokens[tokens.length - 1] || '';
    };

    useEffect(() => {
        if (!open) {
            setSuggestions([]);
            setAnchorEl(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const last = getLastQuery(inputText).toLowerCase();
        if (!last) {
            setSuggestions([]);
            return;
        }
        const matched = users
            .filter(u => u.rollNumber?.toLowerCase().includes(last))
            .slice(0, 8);
        setSuggestions(matched);
    }, [inputText, users, open]);

    const handleSuggestionClick = (rollNumber) => {
        const existingRollNumbers = getChipValues(inputText);
        if (existingRollNumbers.includes(rollNumber)) {
            setSuggestions([]);
            return;
        }
        const parts = inputText.split(',').map(p => p.trim());
        parts[parts.length - 1] = rollNumber;
        const newText = parts.join(', ') + ', ';
        setInputText(newText);
        setSuggestions([]);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
            }
        }, 0);
    };

    const selectedCount = getChipValues(inputText).length;

    return (
        <Dialog
            open={open}
            onClose={() => {
                setAnchorEl(null);
                setSuggestions([]);
                setSelectedBusStop(null);
                onClose();
            }}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                px: 3,
                py: 2,
                backgroundColor: MAIN_COLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <DirectionsBusIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            Map Students to Route
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', mt: 0.3 }}>
                            Select a bus stop and add students to the route
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={() => {
                        setAnchorEl(null);
                        setSuggestions([]);
                        setSelectedBusStop(null);
                        onClose();
                    }}
                    sx={{
                        color: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                            color: '#fff',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
                {/* Bus Stop Selection */}
                {activity && activity.routeStops && activity.routeStops.length > 0 && (
                    <Box sx={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        mb: 2,
                    }}>
                        <Box sx={{
                            px: 2,
                            py: 1.2,
                            backgroundColor: selectedBusStop ? MAIN_LIGHT : '#F9FAFB',
                            borderBottom: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SearchIcon sx={{ fontSize: 16, color: selectedBusStop ? MAIN_COLOR : '#9CA3AF' }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: selectedBusStop ? MAIN_COLOR : '#6B7280' }}>
                                    Select Bus Stop
                                </Typography>
                            </Box>
                            {selectedBusStop && (
                                <Chip
                                    label="Selected"
                                    size="small"
                                    sx={{
                                        backgroundColor: '#16a34a',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: 11,
                                        height: 22,
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ p: 2, backgroundColor: '#fff' }}>
                            <FormControl fullWidth size="small">
                                <InputLabel
                                    id="bus-stop-label"
                                    sx={{
                                        fontSize: 13,
                                        color: selectedBusStop ? MAIN_COLOR : undefined,
                                        '&.Mui-focused': { color: MAIN_COLOR },
                                    }}
                                >
                                    Choose a bus stop from the route *
                                </InputLabel>
                                <Select
                                    labelId="bus-stop-label"
                                    value={selectedBusStop?.point || ''}
                                    onChange={(e) => {
                                        const stop = activity.routeStops.find(s => s.point === e.target.value);
                                        setSelectedBusStop(stop);
                                        const rolls = (stop?.students || []).map(s => s.rollNumber);
                                        setInputText(rolls.length > 0 ? rolls.join(', ') + ', ' : '');
                                    }}
                                    label="Choose a bus stop from the route *"
                                    sx={{
                                        fontSize: '14px',
                                        backgroundColor: '#FAFAFA',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: selectedBusStop ? MAIN_COLOR : '#D1D5DB',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: MAIN_COLOR },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: MAIN_COLOR },
                                    }}
                                    renderValue={() => {
                                        if (!selectedBusStop) return '';
                                        return `${selectedBusStop.point} - ${selectedBusStop.place}`;
                                    }}
                                >
                                    {activity.routeStops.map((stop, index) => (
                                        <MenuItem
                                            key={index}
                                            value={stop.point}
                                            sx={{
                                                fontSize: '14px',
                                                py: 1.2,
                                                '&:hover': { backgroundColor: MAIN_LIGHT },
                                                '&.Mui-selected': {
                                                    backgroundColor: MAIN_LIGHT,
                                                    '&:hover': { backgroundColor: `${MAIN_COLOR}20` },
                                                },
                                            }}
                                        >
                                            <Box>
                                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
                                                    {stop.point}
                                                </Typography>
                                                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                                                    {stop.place} {stop.arrivalTime ? `• ${stop.arrivalTime}` : ''}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                )}

                {/* Student Selection */}
                <Box sx={{
                    opacity: selectedBusStop ? 1 : 0.55,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: selectedBusStop ? 'auto' : 'none',
                }}>
                    <Grid container spacing={2}>
                        {/* Left: Search */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Box sx={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                height: '100%',
                            }}>
                                <Box sx={{
                                    px: 2,
                                    py: 1.2,
                                    backgroundColor: MAIN_LIGHT,
                                    borderBottom: '1px solid #E5E7EB',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}>
                                    <SearchIcon sx={{ fontSize: 16, color: MAIN_COLOR }} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: MAIN_COLOR }}>
                                        Search Roll Numbers
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, backgroundColor: '#fff' }}>
                                    <TextareaAutosize
                                        ref={textareaRef}
                                        value={inputText}
                                        onChange={(e) => {
                                            setInputText(e.target.value);
                                            if (!anchorEl && textareaRef.current) {
                                                setAnchorEl(textareaRef.current);
                                            }
                                        }}
                                        placeholder="Type roll numbers separated by commas (e.g., STU001, STU002, STU003)..."
                                        minRows={10}
                                        style={{
                                            width: '100%',
                                            fontSize: '14px',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            resize: 'none',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            padding: '10px 12px',
                                            boxSizing: 'border-box',
                                            backgroundColor: '#FAFAFA',
                                            color: '#1F2937',
                                            lineHeight: '1.6',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = MAIN_COLOR;
                                            e.target.style.backgroundColor = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E5E7EB';
                                            e.target.style.backgroundColor = '#FAFAFA';
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Grid>

                        {/* Right: Selected Students */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Box sx={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                height: '100%',
                            }}>
                                <Box sx={{
                                    px: 2,
                                    py: 1.2,
                                    backgroundColor: '#F0FDF4',
                                    borderBottom: '1px solid #E5E7EB',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                                            Selected Students
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        backgroundColor: selectedCount > 0 ? '#16a34a' : '#D1D5DB',
                                        borderRadius: '20px',
                                        px: 1.2,
                                        py: 0.1,
                                        minWidth: 24,
                                        textAlign: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                                            {selectedCount}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    p: 2,
                                    backgroundColor: '#fff',
                                    minHeight: '260px',
                                    maxHeight: '260px',
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': { width: '5px' },
                                    '&::-webkit-scrollbar-track': { backgroundColor: '#F3F4F6', borderRadius: '10px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '10px' },
                                }}>
                                    {selectedCount === 0 ? (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '220px',
                                            gap: 1,
                                        }}>
                                            <PeopleAltIcon sx={{ fontSize: 36, color: '#D1D5DB' }} />
                                            <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                                                No students selected yet
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Stack
                                            direction="row"
                                            flexWrap="wrap"
                                            sx={{ columnGap: 1, rowGap: 1 }}
                                        >
                                            {getChipValues(inputText).map((val, index) => (
                                                <Chip
                                                    key={index}
                                                    label={val}
                                                    size="small"
                                                    onDelete={() => removeChip(val)}
                                                    sx={{
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        backgroundColor: MAIN_LIGHT,
                                                        color: MAIN_COLOR,
                                                        border: `1px solid ${MAIN_COLOR}30`,
                                                        '& .MuiChip-deleteIcon': {
                                                            color: `${MAIN_COLOR}80`,
                                                            fontSize: '15px',
                                                        },
                                                        '&:hover': { backgroundColor: '#dce3fa' },
                                                        '&:hover .MuiChip-deleteIcon': { color: '#dc2626' },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Suggestions Popper */}
                <Popper
                    open={suggestions.length > 0 && anchorEl !== null}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    style={{ zIndex: 2000 }}
                >
                    <Paper sx={{
                        width: textareaRef.current?.offsetWidth || 300,
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                    }}>
                        <List dense disablePadding>
                            {suggestions.map((user, i) => (
                                <ListItemButton
                                    key={i}
                                    onClick={() => handleSuggestionClick(user.rollNumber)}
                                    sx={{
                                        fontSize: '13px',
                                        py: 0.8,
                                        '&:hover': {
                                            backgroundColor: MAIN_LIGHT,
                                            color: MAIN_COLOR,
                                        },
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13 }}>
                                        <Box component="span" sx={{ fontWeight: 600, color: MAIN_COLOR }}>
                                            {user.rollNumber}
                                        </Box>
                                        {' '}— {user.name}
                                    </Typography>
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Popper>

                {/* Footer Buttons */}
                <Divider sx={{ mt: 2.5, mb: 2, borderColor: '#E5E7EB' }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setAnchorEl(null);
                            setSuggestions([]);
                            setSelectedBusStop(null);
                            onClose();
                        }}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#6B7280',
                            borderColor: '#D1D5DB',
                            backgroundColor: '#fff',
                            '&:hover': {
                                backgroundColor: '#F3F4F6',
                                borderColor: '#9CA3AF',
                            },
                        }}
                    >
                        Close
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setInputText('');
                            setSuggestions([]);
                            setAnchorEl(null);
                            setSelectedBusStop(null);
                        }}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#6B7280',
                            borderColor: '#D1D5DB',
                            '&:hover': {
                                backgroundColor: '#F9FAFB',
                                borderColor: '#9CA3AF',
                            },
                        }}
                    >
                        Clear All
                    </Button>

                    <Button
                        variant="contained"
                        disabled={!selectedBusStop || selectedCount === 0}
                        onClick={() => {
                            setAnchorEl(null);
                            setSuggestions([]);
                            const payload = {
                                selectedStudents: getChipValues(inputText),
                                busStop: selectedBusStop.place,
                                busStopPoint: selectedBusStop.point,
                                busStopDetails: selectedBusStop
                            };
                            onSave?.(payload);
                            setSelectedBusStop(null);
                            onClose();
                        }}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            fontSize: 13,
                            fontWeight: 600,
                            backgroundColor: MAIN_COLOR,
                            color: '#fff',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#2a46b8',
                                boxShadow: 'none',
                            },
                            '&:disabled': {
                                backgroundColor: '#E5E7EB',
                                color: '#9CA3AF',
                            },
                        }}
                    >
                        Save Mapping ({selectedCount})
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
