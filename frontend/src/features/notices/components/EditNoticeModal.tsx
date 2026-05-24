import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useUpdateNotice } from '../api/update';
import { updateNoticeSchema } from '../types';
import type { UpdateNoticeForm, Notice } from '../types';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  entity: Notice | null;
}

export function EditNoticeModal({ open, onClose, entity }: EditModalProps) {
  const updateMutation = useUpdateNotice();
  const form = useForm<UpdateNoticeForm>({ 
    resolver: zodResolver(updateNoticeSchema), 
    defaultValues: { title: '', details: '', date: '' } 
  });

  useEffect(() => {
    if (entity && open) {
      let formattedDate = '';
      if (entity.date) {
        try {
          formattedDate = new Date(entity.date).toISOString().split('T')[0];
        } catch (e) {
          formattedDate = '';
        }
      }
      form.reset({
        title: String(entity.title),
        details: String(entity.details),
        date: formattedDate
      });
    }
  }, [entity, open]);

  const onSubmit = (data: UpdateNoticeForm) => {
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
      <DialogTitle>Edit Notice</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller name="title" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Title" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="details" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Details" multiline rows={3} fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <Controller name="date" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Date" type="date" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
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
