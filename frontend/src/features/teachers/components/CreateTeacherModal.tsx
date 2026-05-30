import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem } from '@mui/material';
import { useCreateTeacher } from '../api/create';
import { createTeacherSchema } from '../types';
import type { CreateTeacherForm } from '../types';

export function CreateTeacherModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateTeacher();
  const form = useForm<CreateTeacherForm>({ resolver: zodResolver(createTeacherSchema), defaultValues: { name: '', phone: '', gender: '' } });

  const onSubmit = (data: CreateTeacherForm) => createMutation.mutate(data, { onSuccess: () => { form.reset(); onClose(); } });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Teacher</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="phone" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Phone" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="gender" control={form.control} render={({ field, fieldState }) => (
            <TextField {...field} select label="Gender" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          )} />
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

