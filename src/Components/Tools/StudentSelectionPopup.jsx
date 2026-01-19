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
    IconButton
} from '@mui/material';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import { Stack } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';

export default function StudentSelectionPopup({ open, onClose, users = [], onSave, value = '' }) {
    useEffect(() => {
        if (open) {
            setInputText(value);
        }
    }, [open, value]);

    const [inputText, setInputText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
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
                onClose();
            }}
            maxWidth="md"
            fullWidth

        >
            <IconButton
                onClick={() => {
                    setAnchorEl(null);
                    setSuggestions([]);
                    onClose();
                }}
                sx={{
                    position: 'absolute',
                    top: 13,
                    right: 10,
                    color: '#666',
                    '&:hover': {
                        color: '#d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                    },
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ p: 1, }}>
                <Box sx={{ border: "1px solid #ccc", borderRadius: "3px" }}>

                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', mb: 1, px: 2, pt: 2, }}>
                        Add Students
                    </Typography>

                    <Box sx={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", }}>
                        <Grid container>

                            <Grid size={{ lg: 6 }} sx={{ borderRight: '1px solid #ccc' }}>
                                <Box sx={{ minHeight: "300px", p: 2 }}>
                                    <TextareaAutosize
                                        ref={textareaRef}
                                        value={inputText}
                                        onChange={(e) => {
                                            setInputText(e.target.value);
                                            if (!anchorEl && textareaRef.current) {
                                                setAnchorEl(textareaRef.current);
                                            }
                                        }}
                                        placeholder="Search Roll numbers here..."
                                        minRows={10}
                                        style={{
                                            width: '100%',
                                            fontSize: '14px',
                                            borderRadius: '3px',
                                            border: '1px solid #ccc',
                                            resize: 'none',
                                            outline: 'none',
                                            fontFamily: 'sans-serif',
                                            padding: '8px',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ lg: 6 }}>
                                <Box sx={{ p: 2 }}>
                                    <Typography sx={{ color: "#555", fontWeight: "600", textDecoration: "underline" }}> Selected Users</Typography>
                                    <Box sx={{ pt: 2, maxHeight: "260px", overflowY: "auto" }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            flexWrap="wrap"
                                            sx={{
                                                mb: 1,
                                                minHeight: 36,
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
                                                        fontSize: '13px',
                                                        '& .MuiChip-deleteIcon': {
                                                            color: '#888',
                                                            transition: 'color 0.2s ease',
                                                        },
                                                        '&:hover .MuiChip-deleteIcon': {
                                                            color: '#d32f2f',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
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


                    <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setInputText('');
                                setSuggestions([]);
                                setAnchorEl(null);
                            }}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '999px',
                                width: "100px",
                                height: "28px",
                                color: "#000",
                                borderColor: "#000",
                                mr: 2,
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                },
                            }}
                        >
                            Clear
                        </Button>


                        <Button
                            onClick={() => {
                                setAnchorEl(null);
                                setSuggestions([]);
                                onSave?.(getChipValues(inputText));
                                onClose();
                            }}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '25px',
                                width: "100px",
                                height: "28px",
                                color: websiteSettings.textColor,
                                backgroundColor: websiteSettings.mainColor
                            }}
                        >
                            Save
                        </Button>

                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
