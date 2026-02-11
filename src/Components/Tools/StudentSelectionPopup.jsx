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
    InputLabel
} from '@mui/material';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import { Stack } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';

export default function StudentSelectionPopup({ open, onClose, users = [], onSave, value = '', activity = null }) {
    useEffect(() => {
        if (open) {
            setInputText(value);
        }
    }, [open, value]);

    const [inputText, setInputText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBusStop, setSelectedBusStop] = useState(null); // Store full stop object
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

    // const handleSuggestionClick = (rollNumber) => {
    //   const parts = inputText.split(',').map(p => p.trim());
    //   parts[parts.length - 1] = rollNumber;
    //   const newText = parts.join(',') + ',';
    //   setInputText(newText);
    //   setSuggestions([]);

    //   setTimeout(() => {
    //     textareaRef.current?.focus();
    //   }, 100);
    // };

    const handleSuggestionClick = (rollNumber) => {
        // Check if roll number already exists
        const existingRollNumbers = getChipValues(inputText);
        if (existingRollNumbers.includes(rollNumber)) {
            // Roll number already exists, don't add it again
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
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
            }}
        >
            <IconButton
                onClick={() => {
                    setAnchorEl(null);
                    setSuggestions([]);
                    setSelectedBusStop(null);
                    onClose();
                }}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: '#666',
                    zIndex: 1,
                    '&:hover': {
                        color: '#d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                    },
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            {/* Header */}
            <Box sx={{
                px: 3,
                pt: 3,
                pb: 2,
                borderBottom: '1px solid #E5E7EB',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <Typography sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#fff',
                    mb: 0.5
                }}>
                    Map Students to Route
                </Typography>
                <Typography sx={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.9)',
                }}>
                    Select a bus stop and add students to the route
                </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
                {/* Bus Stop Selection Section */}
                {activity && activity.routeStops && activity.routeStops.length > 0 && (
                    <Box sx={{
                        mb: 3,
                        p: 2.5,
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: selectedBusStop ? '#667eea' : '#E5E7EB',
                        backgroundColor: selectedBusStop ? '#F5F7FF' : '#FAFAFA',
                        transition: 'all 0.3s ease',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                backgroundColor: selectedBusStop ? '#667eea' : '#9CA3AF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                            }}>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>1</Typography>
                            </Box>
                            <Typography sx={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: '#1F2937'
                            }}>
                                Select Bus Stop
                            </Typography>
                            {selectedBusStop && (
                                <Chip
                                    label="Selected"
                                    size="small"
                                    sx={{
                                        ml: 'auto',
                                        backgroundColor: '#10B981',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: 11,
                                        height: 24,
                                    }}
                                />
                            )}
                        </Box>

                        <FormControl fullWidth size="small">
                            <InputLabel
                                id="bus-stop-label"
                                sx={{
                                    color: selectedBusStop ? '#667eea' : undefined,
                                    '&.Mui-focused': {
                                        color: '#667eea',
                                    }
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
                                }}
                                label="Choose a bus stop from the route *"
                                sx={{
                                    fontSize: '14px',
                                    backgroundColor: '#fff',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: selectedBusStop ? '#667eea' : '#D1D5DB',
                                        borderWidth: selectedBusStop ? '2px' : '1px',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                        borderWidth: '2px',
                                    },
                                }}
                                renderValue={(value) => {
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
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: '#F5F7FF',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#EEF2FF',
                                                '&:hover': {
                                                    backgroundColor: '#E0E7FF',
                                                },
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
                )}

                {/* Student Selection Section */}
                <Box sx={{
                    p: 2.5,
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: selectedBusStop ? '#E5E7EB' : '#E5E7EB',
                    backgroundColor: selectedBusStop ? '#fff' : '#F9FAFB',
                    opacity: selectedBusStop ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                    pointerEvents: selectedBusStop ? 'auto' : 'none',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            backgroundColor: selectedBusStop ? '#667eea' : '#9CA3AF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                        }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>2</Typography>
                        </Box>
                        <Typography sx={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#1F2937'
                        }}>
                            Add Students
                        </Typography>
                        {!selectedBusStop && (
                            <Typography sx={{
                                ml: 'auto',
                                fontSize: 12,
                                color: '#9CA3AF',
                                fontStyle: 'italic'
                            }}>
                                Select a bus stop first
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{
                        borderTop: "1px solid #E5E7EB",
                        borderRadius: '8px',
                        overflow: 'hidden',
                        mt: 2
                    }}>
                        <Grid container>
                            <Grid size={{ xs: 12, lg: 6 }} sx={{
                                borderRight: { lg: '1px solid #E5E7EB' },
                                borderBottom: { xs: '1px solid #E5E7EB', lg: 'none' }
                            }}>
                                <Box sx={{ p: 2.5, backgroundColor: '#FAFAFA' }}>
                                    <Typography sx={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#6B7280',
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        <Box component="span" sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea'
                                        }} />
                                        Search Student Roll Numbers
                                    </Typography>
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
                                            border: '2px solid #E5E7EB',
                                            resize: 'none',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            padding: '12px',
                                            boxSizing: 'border-box',
                                            backgroundColor: '#fff',
                                            transition: 'border-color 0.2s ease',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E5E7EB';
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, lg: 6 }}>
                                <Box sx={{ p: 2.5, backgroundColor: '#F9FAFB', minHeight: '300px' }}>
                                    <Typography sx={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#6B7280',
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        <Box component="span" sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: '#10B981'
                                        }} />
                                        Selected Students ({getChipValues(inputText).length})
                                    </Typography>
                                    <Box sx={{
                                        maxHeight: "245px",
                                        overflowY: "auto",
                                        pr: 0.5,
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: '#F3F4F6',
                                            borderRadius: '10px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: '#D1D5DB',
                                            borderRadius: '10px',
                                            '&:hover': {
                                                backgroundColor: '#9CA3AF',
                                            },
                                        },
                                    }}>
                                        {getChipValues(inputText).length === 0 ? (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '240px',
                                                color: '#9CA3AF',
                                                fontSize: 13,
                                                fontStyle: 'italic'
                                            }}>
                                                No students selected yet
                                            </Box>
                                        ) : (
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                sx={{
                                                    columnGap: 1,
                                                    rowGap: 1.2,
                                                }}
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
                                                            backgroundColor: '#EEF2FF',
                                                            color: '#4338CA',
                                                            border: '1px solid #C7D2FE',
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#818CF8',
                                                                fontSize: '16px',
                                                                transition: 'all 0.2s ease',
                                                            },
                                                            '&:hover': {
                                                                backgroundColor: '#E0E7FF',
                                                            },
                                                            '&:hover .MuiChip-deleteIcon': {
                                                                color: '#dc2626',
                                                            },
                                                        }}
                                                    />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Suggestions */}
                        <Popper
                            open={suggestions.length > 0 && anchorEl !== null}
                            anchorEl={anchorEl}
                            placement="bottom-start"
                            style={{ zIndex: 2000 }}
                        >
                            <Paper sx={{ width: textareaRef.current?.offsetWidth || 300 }}>
                                <List dense>
                                    {suggestions.map((user, i) => (
                                        <ListItemButton
                                            key={i}
                                            onClick={() => handleSuggestionClick(user.rollNumber)}
                                        >
                                            {user.rollNumber} - {user.name}
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Paper>
                        </Popper>

                    </Box>


                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        pt: 3,
                        pb: 2,
                        borderTop: '1px solid #E5E7EB',
                        mt: 2
                    }}>
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
                                py: 1,
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#6B7280',
                                borderColor: '#D1D5DB',
                                borderWidth: '2px',
                                '&:hover': {
                                    backgroundColor: '#F9FAFB',
                                    borderColor: '#9CA3AF',
                                    borderWidth: '2px',
                                },
                            }}
                        >
                            Clear All
                        </Button>

                        <Button
                            variant="contained"
                            disabled={!selectedBusStop || getChipValues(inputText).length === 0}
                            onClick={() => {
                                setAnchorEl(null);
                                setSuggestions([]);
                                const payload = {
                                    selectedStudents: getChipValues(inputText),
                                    busStop: selectedBusStop.place, // Send the place name instead of point
                                    busStopPoint: selectedBusStop.point, // Also include point identifier
                                    busStopDetails: selectedBusStop // Include full stop object
                                };
                                onSave?.(payload);
                                setSelectedBusStop(null);
                                onClose();
                            }}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 4,
                                py: 1,
                                fontSize: 14,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
                                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                },
                                '&:disabled': {
                                    background: '#E5E7EB',
                                    color: '#9CA3AF',
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            Save Mapping
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
