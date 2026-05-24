import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import { useMyNotices } from '../api/get-my-notices';
import type { Notice } from '@/features/notices/types';

export function MyNoticesPage() {
  const [page, setPage] = useState(1);
  const { data: res, isLoading } = useMyNotices(page);

  const data = res?.data;
  const meta = res?.meta;

  const columns = [
    { id: 'title' as keyof Notice, label: 'Title' },
    { id: 'details' as keyof Notice, label: 'Details' },
    { 
      id: 'date' as keyof Notice, 
      label: 'Date',
      render: (row: Notice) => new Date(row.date).toLocaleDateString()
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
          Notices
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined}
      />
    </Box>
  );
}
