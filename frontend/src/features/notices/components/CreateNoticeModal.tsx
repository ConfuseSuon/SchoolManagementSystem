import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useCreateNotice } from '../api/create';
import { createNoticeSchema } from '../types';
import type { CreateNoticeForm } from '../types';

export function CreateNoticeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateNotice();
  const form = useForm<CreateNoticeForm>({ resolver: zodResolver(createNoticeSchema), defaultValues: { title: '', details: '', date: '' } });

  const onSubmit = (data: CreateNoticeForm) => createMutation.mutate(data, { onSuccess: () => { form.reset(); onClose(); } });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Notice</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="title" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Title" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="details" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Details" multiline rows={3} fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="date" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Date" type="date" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending}>Save</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}


const styles = { content: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 } } as const;
