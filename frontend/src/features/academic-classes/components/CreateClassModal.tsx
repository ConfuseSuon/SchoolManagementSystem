import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useCreateClass } from '../api/create';
import { createClassSchema } from '../types';
import type { CreateClassForm } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateClassModal({ open, onClose }: Props) {
  const createMutation = useCreateClass();
  
  const form = useForm<CreateClassForm>({
    resolver: zodResolver(createClassSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: CreateClassForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Class</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} label="Class Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
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
