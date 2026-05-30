import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useQueryClient } from '@tanstack/react-query';
import { useStudents } from '../api/list';
import { useDeleteStudent } from '../api/delete';
import type { Student } from '../types';
import { EditStudentModal } from '../components/EditStudentModal';
import { CreateStudentModal } from '../components/CreateStudentModal';
import { TransferStudentModal } from '../components/TransferStudentModal';
import type { AcademicClass } from '../../academic-classes/types';
import { CreateLoginModal } from '@/components/CreateLoginModal';

export function StudentsPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useStudents(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteStudent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Student | null>(null);
  const [transferEntity, setTransferEntity] = useState<Student | null>(null);
  const [loginEntityId, setLoginEntityId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const columns: Column<Student>[] = [
    { id: 'name', label: 'Name' },
    { id: 'rollNumber', label: 'Roll Number', render: (row) => row.rollNumber || '-' },
    { 
      id: 'email', 
      label: 'Email', 
      render: (row) => row.email || <span style={{ color: '#98989D', fontStyle: 'italic' }}>No Login</span> 
    },
    { id: 'classId', label: 'Class', render: (row) => typeof row.classId === 'object' ? (row.classId as AcademicClass)?.name || '-' : row.classId || '-' },
    { id: '_id', label: 'Actions', render: (row) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {!row.email && (
          <Button size="small" color="success" onClick={() => setLoginEntityId(row._id)}>Create Login</Button>
        )}
        <Button size="small" color="primary" onClick={() => setEditEntity(row)}>Edit</Button>
        <Button size="small" color="secondary" onClick={() => setTransferEntity(row)}>Transfer</Button>
        <Button size="small" color="error" onClick={() => deleteMutation.mutate(row._id)}>Delete</Button>
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
      <TransferStudentModal open={!!transferEntity} onClose={() => setTransferEntity(null)} student={transferEntity} />
      <CreateLoginModal 
        open={!!loginEntityId} 
        onClose={() => setLoginEntityId(null)} 
        entityId={loginEntityId || ''} 
        role="Student" 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
      />
    </Box>
  );
}

const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;

