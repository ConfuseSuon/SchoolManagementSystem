import { useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon, LogoutOutlined as LogoutIcon, GridView } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { api } from '@/lib/axios';

const drawerWidth = 260;

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface Props {
  user: string;
  navItems: NavItem[];
}

export function DashboardLayout({ user, navItems }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const userObj = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const userRole = user?.charAt(0).toUpperCase() + user?.slice(1);

  const roleName = userObj?.role || userRole;

  const { data: profile } = useQuery({
    queryKey: ['user-profile', userObj?.sub, roleName],
    queryFn: async () => {
      if (!userObj) return null;
      if (roleName === 'Admin') {
        const res = await api.get<any>('/admins/profile');
        return res.data;
      } else if (roleName === 'Teacher') {
        const res = await api.get<any>('/teachers/me');
        return res.data;
      } else if (roleName === 'Student') {
        const res = await api.get<any>('/students/me');
        return res.data;
      }
      return null;
    },
    enabled: !!userObj,
  });


  const displayName = profile?.name || (roleName === 'Admin'
    ? 'Admin User'
    : roleName === 'Teacher'
      ? 'Teacher User'
      : roleName === 'Student'
        ? 'Student User'
        : 'Guest User');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: any) => n[0])
    .join('')
    .toUpperCase();

  const drawer = (
    <Box sx={styles.drawerContainer}>
      <Toolbar sx={styles.logoToolbar}>
        <GridView sx={styles.logoIcon} />
        <Typography variant="h6" noWrap sx={styles.logoText}>School Mgmt.</Typography>
      </Toolbar>
      <List sx={styles.navItemsList(theme)}>
        {navItems.map((item) => (
          <ListItem disablePadding sx={styles.listItem} key={item.path}>
            <ListItemButton selected={location.pathname === item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} sx={styles.listButton}>
              <ListItemIcon sx={styles.listIcon}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={styles.listText} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={styles.bottomFixedSection}>
        <List sx={styles.profileList}>
          <ListItem disablePadding sx={styles.listItem}>
            <ListItemButton
              onClick={() => {
                navigate(`/${roleName.toLowerCase()}/profile`);
                setMobileOpen(false);
              }}
              sx={styles.profileButton}
            >
              <Avatar sx={styles.profileAvatar}>{initials}</Avatar>
              <Box sx={styles.profileDetails}>
                <Typography sx={styles.profileName}>{displayName}</Typography>
                <Typography sx={styles.profileRole}>{roleName}</Typography>
              </Box>
            </ListItemButton>
          </ListItem>
        </List>
        <List sx={styles.logoutList}>
          <ListItem disablePadding sx={styles.listItem}>
            <ListItemButton
              onClick={logout}
              sx={styles.logoutButton}
            >
              <ListItemIcon sx={styles.logoutIcon}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={styles.logoutText} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={styles.rootBox}>
      <AppBar position="fixed" elevation={0} sx={styles.appBar}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={styles.menuIcon}><MenuIcon /></IconButton>
          <Box sx={styles.spacer} />
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={styles.navBox}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={styles.mobileDrawer}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={styles.desktopDrawer} open>{drawer}</Drawer>
      </Box>
      <Box component="main" sx={styles.mainContent}><Outlet /></Box>
    </Box>
  );
}

const styles = {
  drawerContainer: { display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' },
  logoToolbar: {
    height: 64,
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 3,
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  logoIcon: { color: 'text.primary', fontSize: 20 },
  logoText: { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' },
  navItemsList: (theme: any) => ({
    flex: 1,
    overflowY: 'auto',
    px: 2,
    py: 1.5,
    '&::-webkit-scrollbar': { width: '4px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      background: 'transparent',
      borderRadius: '4px'
    },
    '.MuiDrawer-paper:hover &::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
    },
  }),
  listItem: { mb: 0.5 },
  listButton: {
    borderRadius: '10px',
    py: 1,
    px: 2,
    color: 'text.secondary',
    borderLeft: '3px solid transparent',
    '&.Mui-selected': {
      bgcolor: 'rgba(0, 102, 204, 0.08)',
      color: '#0066CC',
      borderLeft: '3px solid #0066CC',
      borderRadius: '10px',
      '&:hover': { bgcolor: 'rgba(0, 102, 204, 0.12)' },
      '& .MuiListItemText-primary': { fontWeight: 600, color: '#0066CC' },
      '& .MuiListItemIcon-root': { color: '#0066CC' },
    },
    '&:hover': { bgcolor: 'action.hover' },
  },
  listIcon: { minWidth: 36, color: 'inherit' },
  listText: { '& .MuiListItemText-primary': { fontWeight: 500, fontSize: '0.925rem' } },
  bottomFixedSection: {
    flexShrink: 0,
    borderTop: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
  },
  profileList: {
    px: 2,
    py: 1,
  },
  profileButton: {
    borderRadius: '10px',
    py: 1,
    px: 2,
    color: 'text.secondary',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    width: '100%',
    '&:hover': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
  },
  profileAvatar: {
    width: 36,
    height: 36,
    bgcolor: '#0066CC',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.2,
    color: 'text.primary',
  },
  profileRole: {
    color: 'text.secondary',
    fontSize: '0.75rem',
    lineHeight: 1.2,
  },
  logoutList: {
    px: 2,
    pb: 1,
  },
  logoutButton: {
    borderRadius: '10px',
    py: 1,
    px: 2,
    color: 'error.main',
    '&:hover': {
      bgcolor: 'rgba(211, 47, 47, 0.04)',
    },
  },
  logoutIcon: {
    minWidth: 36,
    color: 'error.main',
  },
  logoutText: {
    '& .MuiListItemText-primary': {
      fontWeight: 500,
      fontSize: '0.925rem',
      color: 'error.main',
    },
  },
  rootBox: { display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' },
  appBar: { width: { sm: 'calc(100% - ' + drawerWidth + 'px)' }, ml: { sm: drawerWidth + 'px' }, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' },
  menuIcon: { mr: 2, display: { sm: 'none' } },
  headerTitle: { flexGrow: 1, fontWeight: 700, letterSpacing: '-0.3px', fontSize: '1.1rem' },
  spacer: { flexGrow: 1 },
  navBox: { width: { sm: drawerWidth }, flexShrink: { sm: 0 } },
  mobileDrawer: { display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' } },
  desktopDrawer: { display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' } },
  mainContent: { flexGrow: 1, p: { xs: 2, sm: 3, md: 5 }, width: { sm: 'calc(100% - ' + drawerWidth + 'px)' }, mt: 8 },
} as const;
