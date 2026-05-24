import { DashboardLayout } from './DashboardLayout';
import { Dashboard as DashboardIcon, School as SchoolIcon, Class as ClassIcon, Subject as SubjectIcon, Person as PersonIcon, People as PeopleIcon, Campaign as CampaignIcon, Report as ReportIcon } from '@mui/icons-material';

export function AdminLayout() {
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <DashboardIcon color="primary" /> },
    { label: 'Schools', path: '/admin/schools', icon: <SchoolIcon color="primary" /> },
    { label: 'Classes', path: '/admin/classes', icon: <ClassIcon color="primary" /> },
    { label: 'Subjects', path: '/admin/subjects', icon: <SubjectIcon color="primary" /> },
    { label: 'Teachers', path: '/admin/teachers', icon: <PersonIcon color="primary" /> },
    { label: 'Students', path: '/admin/students', icon: <PeopleIcon color="primary" /> },
    { label: 'Notices', path: '/admin/notices', icon: <CampaignIcon color="primary" /> },
    { label: 'Complaints', path: '/admin/complains', icon: <ReportIcon color="primary" /> },
  ];

  return <DashboardLayout user="admin" navItems={navItems} />;
}
