import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useUpdateTeacher } from '../api/update';
import { updateTeacherSchema } from '../types';
import type { UpdateTeacherForm, Teacher } from '../types';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  entity: Teacher | null;
}

export function EditTeacherModal({ open, onClose, entity }: EditModalProps) {
  const updateMutation = useUpdateTeacher();
  const form = useForm<UpdateTeacherForm>({ 
    resolver: zodResolver(updateTeacherSchema), 
    defaultValues: { name: '' } 
  });

  useEffect(() => {
    if (entity && open) {
      form.reset({
        name: String(entity.name)
      });
    }
  }, [entity, open]);

  const onSubmit = (data: UpdateTeacherForm) => {
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
      <DialogTitle>Edit Teacher</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
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
