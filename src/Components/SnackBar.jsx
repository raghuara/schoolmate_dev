import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function SnackBar({ open, message, setOpen, status, color }) {
  const icon = status ? <CheckCircleIcon fontSize="inherit" /> : <ErrorOutlineIcon fontSize="inherit" />;

  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
      onClose={() => setOpen(false)} 
      slots={{ transition: Slide }}
      slotProps={{
        transition: {
          direction: "left",
          timeout: 500,
        },
      }}
    >
      <Alert
        icon={icon} 
        severity={color ? 'success' : 'error'}
        variant="filled"
        sx={{ width: '100%', display: 'flex', alignItems: 'center' }} 
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default SnackBar;
