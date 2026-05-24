import { Snackbar, Alert } from '@mui/material';
import { useUiStore } from '../stores/ui-store';

export function GlobalToast() {
  const { toast, hideToast } = useUiStore();
  return (
    <Snackbar open={toast.open} autoHideDuration={6000} onClose={hideToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert onClose={hideToast} severity={toast.type} sx={{ width: '100%' }} variant="filled">
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
