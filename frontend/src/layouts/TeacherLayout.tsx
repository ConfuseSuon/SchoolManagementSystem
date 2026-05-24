import { DashboardLayout } from './DashboardLayout';
import { Dashboard as DashboardIcon, Class as ClassIcon, Subject as SubjectIcon} from '@mui/icons-material';

export function TeacherLayout() {
  const navItems = [
    { label: 'Dashboard', path: '/teacher', icon: <DashboardIcon color="primary" /> },
    { label: 'My Subjects', path: '/teacher/subjects', icon: <SubjectIcon color="primary" /> },
    { label: 'My Classes', path: '/teacher/classes', icon: <ClassIcon color="primary" /> },
  ];

  return <DashboardLayout user="teacher" navItems={navItems} />;
}
