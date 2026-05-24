import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem } from '@mui/material';
import { useCreateStudent } from '../api/create';
import { createStudentSchema } from '../types';
import type { CreateStudentForm } from '../types';
import { useClasses } from '@/lib/shared-queries';

export function CreateStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateStudent();
  const { data: classes } = useClasses();
  
  const form = useForm<CreateStudentForm>({ 
    resolver: zodResolver(createStudentSchema), 
    defaultValues: { name: '', email: '', password: '', classId: '', rollNumber: '' } 
  });

  const onSubmit = (data: CreateStudentForm) => createMutation.mutate(data, { onSuccess: () => { form.reset(); onClose(); } });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Student</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="email" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Email" type="email" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="password" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Password" type="password" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="rollNumber" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Roll Number (Optional)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="classId" control={form.control} render={({ field, fieldState }) => (
            <TextField {...field} select label="Class" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message}>
              {classes?.data?.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
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
