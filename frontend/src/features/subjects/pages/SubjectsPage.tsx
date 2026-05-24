import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useSubjects } from '../api/list';
import { useDeleteSubject } from '../api/delete';
import type { Subject } from '../types';
import { EditSubjectModal } from '../components/EditSubjectModal';
import { CreateSubjectModal } from '../components/CreateSubjectModal';
import type { AcademicClass } from '../../academic-classes/types';

export function SubjectsPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useSubjects(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteSubject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Subject | null>(null);

  const columns: Column<Subject>[] = [
    { id: 'name', label: 'Subject Name' },
    { id: 'code', label: 'Code', render: (row) => row.code || '-' },
    {
      id: 'classId',
      label: 'Class',
      render: (row) => typeof row.classId === 'object' ? (row.classId as AcademicClass)?.name || '-' : row.classId || '-'
    },
    {
      id: 'teacherId',
      label: 'Teacher',
      render: (row) => typeof row.teacherId === 'object' ? (row.teacherId as AcademicClass)?.name || '-' : row.teacherId || '-'
    },
    {
      id: '_id',
      label: 'Actions',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="primary" onClick={() => setEditEntity(row)}>Edit</Button>
          <Button color="error" onClick={() => deleteMutation.mutate(row._id)} disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h4">Subjects</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>Add Subject</Button>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
      <CreateSubjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditSubjectModal open={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />
    </Box>
  );
}

const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;
