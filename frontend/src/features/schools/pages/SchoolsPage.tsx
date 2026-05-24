import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useSchools } from '../api/list';
import { useDeleteSchool } from '../api/delete';
import type { School } from '../types';
import { EditSchoolModal } from '../components/EditSchoolModal';
import { CreateSchoolModal } from '../components/CreateSchoolModal';

export function SchoolsPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useSchools(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteSchool();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<School | null>(null);

  const columns: Column<School>[] = [
    { id: 'name', label: 'School Name' },
    { id: 'address', label: 'Address' },
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
        <Typography variant="h4">Schools</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>Add School</Button>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
      <CreateSchoolModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditSchoolModal open={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />
    </Box>
  );
}

const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;
