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
  TextareaAutosize
} from '@mui/material';
import { selectWebsiteSettings } from '../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';

export default function AddAdmissionNumbersDialog({ open, onClose, users = [], onSave, value = '' }) {
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
    <Dialog open={open} onClose={() => {
      setAnchorEl(null);
      setSuggestions([]);
      onClose();
    }} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 'bold', mb: 1 }}>
          Add Admission Numbers
        </Typography>

        <Box sx={{ position: 'relative' }}>
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
            minRows={6}
            style={{
              width: '100%',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              resize: 'none',
              outline: 'none',
              fontFamily:"sans-serif"
            }}
          />

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

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            // variant="contained"
            onClick={() => {
              setAnchorEl(null);
              setSuggestions([]);
              onSave?.(inputText);
              onClose();
            }}
            sx={{
              textTransform: 'none',
              borderRadius: '25px',
              px: 4, 
              fontWeight:"600",
              color: websiteSettings.textColor, 
              backgroundColor: websiteSettings.mainColor 
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
