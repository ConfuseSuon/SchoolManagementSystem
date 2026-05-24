import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useUpdateSubject } from '../api/update';
import { updateSubjectSchema } from '../types';
import type { UpdateSubjectForm, Subject } from '../types';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  entity: Subject | null;
}

export function EditSubjectModal({ open, onClose, entity }: EditModalProps) {
  const updateMutation = useUpdateSubject();
  const form = useForm<UpdateSubjectForm>({ 
    resolver: zodResolver(updateSubjectSchema), 
    defaultValues: { name: '', code: '' } 
  });

  useEffect(() => {
    if (entity && open) {
      form.reset({
        name: String(entity.name),
        code: entity.code ? String(entity.code) : ''
      });
    }
  }, [entity, open]);

  const onSubmit = (data: UpdateSubjectForm) => {
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
      <DialogTitle>Edit Subject</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="code" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Code (Optional)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
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
