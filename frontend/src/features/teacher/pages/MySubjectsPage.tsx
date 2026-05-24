import { Box, Typography } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import { useMySubjects } from '../api/get-my-subjects';
import type { Subject } from '@/features/subjects/types';
import type { AcademicClass } from '@/features/academic-classes/types';

export function MySubjectsPage() {
  const { data: subjects, isLoading } = useMySubjects();

  const columns = [
    { id: 'name' as keyof Subject, label: 'Subject Name' },
    { id: 'code' as keyof Subject, label: 'Code' },
    { 
      id: 'classId' as keyof Subject, 
      label: 'Class Name',
      render: (row: Subject) => (row.classId as AcademicClass)?.name || '-'
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
          My Subjects
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={subjects || []}
        isLoading={isLoading}
      />
    </Box>
  );
}
