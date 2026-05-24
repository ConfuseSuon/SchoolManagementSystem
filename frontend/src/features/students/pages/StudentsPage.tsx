import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useStudents } from '../api/list';
import { useDeleteStudent } from '../api/delete';
import type { Student } from '../types';
import { EditStudentModal } from '../components/EditStudentModal';
import { CreateStudentModal } from '../components/CreateStudentModal';
import type { AcademicClass } from '../../academic-classes/types';

export function StudentsPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useStudents(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteStudent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Student | null>(null);

  const columns: Column<Student>[] = [
    { id: 'name', label: 'Name' },
    { id: 'rollNumber', label: 'Roll Number', render: (row) => row.rollNumber || '-' },
    { id: 'email', label: 'Email' },
    { id: 'classId', label: 'Class', render: (row) => typeof row.classId === 'object' ? (row.classId as AcademicClass)?.name || '-' : row.classId || '-' },
    { id: '_id', label: 'Actions', render: (row) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button color="primary" onClick={() => setEditEntity(row)}>Edit</Button>
        <Button color="error" onClick={() => deleteMutation.mutate(row._id)}>Delete</Button>
      </Box>
    ) }
  ];

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h4">Students</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>Add Student</Button>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
      <CreateStudentModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditStudentModal open={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />
    </Box>
  );
}

const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;
