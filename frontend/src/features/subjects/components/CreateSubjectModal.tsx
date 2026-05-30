import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useCreateSubject } from '../api/create';
import { createSubjectSchema } from '../types';
import type { CreateSubjectForm } from '../types';
import { useClasses, useTeachers } from '@/lib/shared-queries';
import { AsyncSearchSelect } from '@/components/AsyncSearchSelect';

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
          <AsyncSearchSelect
            name="teacherId"
            control={form.control}
            label="Teacher (Optional)"
            placeholder="Type to search teacher..."
            minChars={0}
            fetchFn={async (query) => {
              const list = teachers?.data || [];
              return list.filter((t: any) =>
                t.name.toLowerCase().includes(query.toLowerCase())
              );
            }}
            getOptionLabel={(option: any) => option.name}
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
