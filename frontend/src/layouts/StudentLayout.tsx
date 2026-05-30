import { DashboardLayout } from './DashboardLayout';
import { 
  Dashboard as DashboardIcon, 
  Campaign as CampaignIcon, 
  Report as ReportIcon,
  AssignmentTurnedIn as AttendanceIcon,
  Assignment as ExamIcon
} from '@mui/icons-material';

export function StudentLayout() {
  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <DashboardIcon color="primary" /> },
    { label: 'Attendance Summary', path: '/student/attendance', icon: <AttendanceIcon color="primary" /> },
    { label: 'My Results', path: '/student/results', icon: <ExamIcon color="primary" /> },
    { label: 'Notices', path: '/student/notices', icon: <CampaignIcon color="primary" /> },
    { label: 'My Complaints', path: '/student/complaints', icon: <ReportIcon color="primary" /> },
  ];

  return <DashboardLayout user="student" navItems={navItems} />;
}
