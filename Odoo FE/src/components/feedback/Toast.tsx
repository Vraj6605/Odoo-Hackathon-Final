import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export interface ToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onClose,
  message,
  severity = 'success',
  duration = 4000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        variant="filled" 
        sx={{ width: '100%', borderRadius: '8px' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
