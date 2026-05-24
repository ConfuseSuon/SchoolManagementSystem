import { DashboardLayout } from './DashboardLayout';
import { Dashboard as DashboardIcon, Campaign as CampaignIcon, Report as ReportIcon } from '@mui/icons-material';

export function StudentLayout() {
  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <DashboardIcon color="primary" /> },
    { label: 'Notices', path: '/student/notices', icon: <CampaignIcon color="primary" /> },
    { label: 'My Complaints', path: '/student/complaints', icon: <ReportIcon color="primary" /> },
  ];

  return <DashboardLayout user="student" navItems={navItems} />;
}
