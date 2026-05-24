import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataTable } from '@/components/DataTable';
import { usePagination } from '@/lib/use-pagination';
import { useMyComplains } from '../api/get-my-complains';
import { useCreateComplain, createComplainSchema, type CreateComplainDto } from '../api/create-complain';
import type { Complain } from '@/features/complains/types';

export function MyComplainsPage() {
  const { page, setPage } = usePagination();
  const { data: complainsData, isLoading } = useMyComplains(page);
  const [open, setOpen] = useState(false);
  const createMutation = useCreateComplain();

  const { control, handleSubmit, reset } = useForm<CreateComplainDto>({
    resolver: zodResolver(createComplainSchema),
  });

  const columns = [
    { id: 'complaint' as keyof Complain, label: 'Complaint' },
    {
      id: 'date' as keyof Complain,
      label: 'Date',
      render: (row: Complain) => new Date(row.date).toLocaleDateString(),
    },
  ];

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = (data: CreateComplainDto) => {
    createMutation.mutate(data, { onSuccess: handleClose });
  };

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>
          My Complaints
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={styles.addButton}>
          Submit Complaint
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={complainsData?.data || []}
        isLoading={isLoading}
        pagination={
          complainsData?.meta
            ? { page: complainsData.meta.page, total: complainsData.meta.total, limit: 10, onPageChange: setPage }
            : undefined
        }
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: styles.dialogPaper } }}>
        <DialogTitle sx={styles.dialogTitle}>Submit Complaint</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={styles.dialogContent}>
            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="complaint"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Complaint"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={styles.dialogActions}>
            <Button onClick={handleClose} sx={styles.cancelButton}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending} sx={styles.submitButton}>
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

const styles = {
  header: { mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' },
  addButton: { borderRadius: 2, textTransform: 'none', fontWeight: 600 },
  dialogPaper: { borderRadius: 3, p: 1 },
  dialogTitle: { fontWeight: 700 },
  dialogContent: { display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 },
  dialogActions: { p: 2, pt: 0 },
  cancelButton: { color: 'text.secondary', fontWeight: 600 },
  submitButton: { borderRadius: 2, textTransform: 'none', fontWeight: 600 },
} as const;
