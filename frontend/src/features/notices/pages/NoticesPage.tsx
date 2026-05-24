import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useNotices } from '../api/list';
import { useDeleteNotice } from '../api/delete';
import type { Notice } from '../types';
import { EditNoticeModal } from '../components/EditNoticeModal';
import { CreateNoticeModal } from '../components/CreateNoticeModal';

export function NoticesPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useNotices(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteNotice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Notice | null>(null);

  const columns: Column<Notice>[] = [
    { id: 'title', label: 'Title' },
    { id: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { id: '_id', label: 'Actions', render: (row) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button color="primary" onClick={() => setEditEntity(row)}>Edit</Button>
        <Button color="error" onClick={() => deleteMutation.mutate(row._id)}>Delete</Button>
      </Box>
    ) }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Notices</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>Add Notice</Button>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
      <CreateNoticeModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditNoticeModal open={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />
    </Box>
  );
}
