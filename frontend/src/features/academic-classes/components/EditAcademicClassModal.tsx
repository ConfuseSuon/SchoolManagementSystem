import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useUpdateAcademicClass } from '../api/update';
import { updateAcademicClassSchema } from '../types';
import type { UpdateAcademicClassForm, AcademicClass } from '../types';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  entity: AcademicClass | null;
}

export function EditAcademicClassModal({ open, onClose, entity }: EditModalProps) {
  const updateMutation = useUpdateAcademicClass();
  const form = useForm<UpdateAcademicClassForm>({ 
    resolver: zodResolver(updateAcademicClassSchema), 
    defaultValues: { name: '' } 
  });

  useEffect(() => {
    if (entity && open) {
      form.reset({
        name: String(entity.name)
      });
    }
  }, [entity, open]);

  const onSubmit = (data: UpdateAcademicClassForm) => {
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
      <DialogTitle>Edit Class</DialogTitle>
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
