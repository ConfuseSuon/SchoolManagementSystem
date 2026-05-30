import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { api } from '@/lib/axios';
import { useClasses } from '@/lib/shared-queries';
import { queryKeys } from '@/lib/query-keys';
import type { Student } from '../types';
import { AsyncSearchSelect } from '@/components/AsyncSearchSelect';

interface TransferStudentModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

export function TransferStudentModal({ open, onClose, student }: TransferStudentModalProps) {
  const queryClient = useQueryClient();
  const { data: classes } = useClasses();

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: queryKeys.academicYears.list(),
    queryFn: async () => {
      const res = await api.get<any[]>('/academic-years');
      return res.data;
    },
  });

  const form = useForm({
    defaultValues: { toClassId: '', academicYearId: '' },
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => api.post('/enrollments/transfer', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      form.reset();
      onClose();
    },
  });

  const onSubmit = (data: any) => {
    if (!student) return;
    transferMutation.mutate({
      studentId: student._id,
      toClassId: data.toClassId,
      academicYearId: data.academicYearId,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Transfer Student: {student?.name}</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent sx={styles.content}>
          <AsyncSearchSelect
            name="toClassId"
            control={form.control}
            label="Transfer to Class"
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
            name="academicYearId"
            control={form.control}
            label="Academic Year"
            placeholder="Type to search academic year..."
            minChars={0}
            fetchFn={async (query) => {
              const list = academicYears || [];
              return list.filter((y: any) =>
                y.name.toLowerCase().includes(query.toLowerCase())
              );
            }}
            getOptionLabel={(option: any) => `${option.name} ${option.isActive ? '(Active)' : ''}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={transferMutation.isPending}>
            {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

const styles = {
  content: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 },
} as const;
