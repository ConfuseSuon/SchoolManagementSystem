import { Box, Typography, List, ListItem, ListItemText, Paper, CircularProgress, Divider, Chip } from '@mui/material';
import { useMySubjects } from '../api/get-my-subjects';
import type { AcademicClass } from '@/features/academic-classes/types';

export function MyClassesPage() {
  const { data: subjects, isLoading } = useMySubjects();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Derive unique classes and subject count per class
  const classMap = new Map<string, { className: string; subjectCount: number }>();
  
  subjects?.forEach((s) => {
    if (s.classId) {
      const classId = (s.classId as AcademicClass)._id;
      const className = (s.classId as AcademicClass).name;
      
      if (!classMap.has(classId)) {
        classMap.set(classId, { className, subjectCount: 1 });
      } else {
        const entry = classMap.get(classId)!;
        entry.subjectCount += 1;
      }
    }
  });

  const classesList = Array.from(classMap.values());

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
          My Classes
        </Typography>
        <Typography color="text.secondary">Classes where you teach subjects</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        {classesList.length > 0 ? (
          <List disablePadding>
            {classesList.map((c, idx) => (
              <Box key={idx}>
                <ListItem sx={{ py: 2, px: 3 }}>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 600 }}>{c.className}</Typography>}
                  />
                  <Chip 
                    label={`${c.subjectCount} Subject${c.subjectCount > 1 ? 's' : ''}`}
                    size="small"
                    sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.06)' }}
                  />
                </ListItem>
                {idx < classesList.length - 1 && <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />}
              </Box>
            ))}
          </List>
        ) : (
          <Typography sx={{ p: 3, color: 'text.secondary' }}>No classes assigned.</Typography>
        )}
      </Paper>
    </Box>
  );
}
