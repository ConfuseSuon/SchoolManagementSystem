import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem } from '@mui/material';
import { useCreateStudent } from '../api/create';
import { createStudentSchema } from '../types';
import type { CreateStudentForm } from '../types';
import { useClasses } from '@/lib/shared-queries';
import { AsyncSearchSelect } from '@/components/AsyncSearchSelect';

export function CreateStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateStudent();
  const { data: classes } = useClasses();
  
  const form = useForm<CreateStudentForm>({ 
    resolver: zodResolver(createStudentSchema), 
    defaultValues: { name: '', phone: '', gender: '', classId: '', rollNumber: '' } 
  });

  const onSubmit = (data: CreateStudentForm) => createMutation.mutate(data, { onSuccess: () => { form.reset(); onClose(); } });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Student</DialogTitle>
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
          <Controller name="rollNumber" control={form.control} render={({ field, fieldState }) => <TextField {...field} label="Roll Number (Optional)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          <AsyncSearchSelect
            name="classId"
            control={form.control}
            label="Class"
            placeholder="Type to search class..."
            minChars={0}
            fetchFn={async (query) => {
              const list = classes?.data || [];
              return list.filter((c: any) =>
                c.name.toLowerCase().includes(query.toLowerCase())
              );
            }}
            getOptionLabel={(option: any) => option.name}
          />
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

