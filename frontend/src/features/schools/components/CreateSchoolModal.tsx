import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useCreateSchool } from '../api/create';
import { createSchoolSchema } from '../types';
import type { CreateSchoolForm } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateSchoolModal({ open, onClose }: Props) {
  const createMutation = useCreateSchool();
  
  const form = useForm<CreateSchoolForm>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { name: '', address: '' },
  });

  const onSubmit = (data: CreateSchoolForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New School</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} label="School Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField {...field} label="Address" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
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
