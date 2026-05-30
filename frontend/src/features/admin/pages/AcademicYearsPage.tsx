import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: years, isLoading } = useQuery({
    queryKey: queryKeys.academicYears.list(),
    queryFn: async () => {
      const res = await api.get<AcademicYear[]>('/academic-years');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/academic-years', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.list() });
      setIsModalOpen(false);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/academic-years/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.list() });
    },
  });

  const form = useForm({
    defaultValues: { name: '', startDate: '', endDate: '', isActive: false },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const columns: Column<AcademicYear>[] = [
    { id: 'name', label: 'Name' },
    { id: 'startDate', label: 'Start Date', render: (row) => new Date(row.startDate).toLocaleDateString() },
    { id: 'endDate', label: 'End Date', render: (row) => new Date(row.endDate).toLocaleDateString() },
    { id: 'isActive', label: 'Status', render: (row) => (row.isActive ? 'Active' : 'Inactive') },
    {
      id: '_id',
      label: 'Actions',
      render: (row) => (
        <Button
          variant="outlined"
          size="small"
          disabled={row.isActive || activateMutation.isPending}
          onClick={() => activateMutation.mutate(row._id)}
        >
          {row.isActive ? 'Active' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Typography variant="h4">Academic Years</Typography>
        <Button variant="contained" onClick={() => { form.reset(); setIsModalOpen(true); }}>
          Add Academic Year
        </Button>
      </Box>

      <DataTable columns={columns} data={years || []} isLoading={isLoading} />

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Academic Year</DialogTitle>
        <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent sx={styles.modalContent}>
            <Controller
              name="name"
              control={form.control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Name (e.g. 2025-2026)"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="startDate"
              control={form.control}
              rules={{ required: 'Start Date is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="endDate"
              control={form.control}
              rules={{ required: 'End Date is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Set Active immediately"
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

const styles = {
  root: {},
  header: { display: 'flex', justifyContent: 'space-between', mb: 4 },
  modalContent: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 },
} as const;
