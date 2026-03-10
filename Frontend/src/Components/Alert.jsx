import { useState, useEffect } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

export default function Alert({ message, type = 'info', onClose, duration = 4000 }) {
  const [open, setOpen] = useState(!!message);

  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    onClose?.();
  };

  return (
    <Snackbar open={open} autoHideDuration={duration} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <MuiAlert onClose={handleClose} severity={type} variant="filled" sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
}
