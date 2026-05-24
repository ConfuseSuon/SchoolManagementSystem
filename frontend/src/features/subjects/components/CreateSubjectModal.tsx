import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem } from '@mui/material';
import { useCreateSubject } from '../api/create';
import { createSubjectSchema } from '../types';
import type { CreateSubjectForm } from '../types';
import { useClasses, useTeachers } from '@/lib/shared-queries';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateSubjectModal({ open, onClose }: Props) {
  const createMutation = useCreateSubject();
  const { data: classes } = useClasses();
  const { data: teachers } = useTeachers();
  
  const form = useForm<CreateSubjectForm>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: { name: '', code: '', classId: '', teacherId: '' },
  });

  const onSubmit = (data: CreateSubjectForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Subject</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} label="Subject Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} label="Subject Code (Optional)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />
          <Controller
            name="classId"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} select label="Class" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message}>
                {classes?.data?.map((c) => (
                  <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="teacherId"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} select label="Teacher (Optional)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message}>
                <MenuItem value="">None</MenuItem>
                {teachers?.data?.map((t) => (
                  <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                ))}
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

const styles = { content: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 } } as const;
