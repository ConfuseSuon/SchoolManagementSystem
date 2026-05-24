import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useUpdateStudent } from '../api/update';
import { updateStudentSchema } from '../types';
import type { UpdateStudentForm, Student } from '../types';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  entity: Student | null;
}

export function EditStudentModal({ open, onClose, entity }: EditModalProps) {
  const updateMutation = useUpdateStudent();
  
  const form = useForm<UpdateStudentForm>({ 
    resolver: zodResolver(updateStudentSchema), 
    defaultValues: { name: '', rollNumber: '' } 
  });

  useEffect(() => {
    if (entity && open) {
      form.reset({
        name: String(entity.name),
        rollNumber: entity.rollNumber ? String(entity.rollNumber) : ''
      });
    }
  }, [entity, open]);

  const onSubmit = (data: UpdateStudentForm) => {
    if (!entity) return;
    updateMutation.mutate({ id: entity._id, data }, { 
      onSuccess: () => { 
        form.reset(); 
        onClose(); 
      } 
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Student</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="rollNumber" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Roll Number (Optional)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={updateMutation.isPending}>Save</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

const styles = { content: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 } } as const;
