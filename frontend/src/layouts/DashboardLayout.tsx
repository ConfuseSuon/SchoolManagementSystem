import { useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { Menu as MenuIcon, ExitToApp as LogoutIcon, GridView } from '@mui/icons-material';
import { useAuthStore } from '../stores/auth-store';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    console.log(user);
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={styles.drawerContainer}>
      <Toolbar sx={styles.logoToolbar}>
        <GridView sx={styles.logoIcon} />
        <Typography variant="h6" noWrap sx={styles.logoText}>School Mgmt.</Typography>
      </Toolbar>
      <List sx={styles.navItemsList}>
        {navItems.map((item) => (
          <ListItem disablePadding sx={styles.listItem} key={item.path}>
            <ListItemButton selected={location.pathname === item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} sx={styles.listButton}>
              <ListItemIcon sx={styles.listIcon}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={styles.listText} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={styles.logoutBox}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton onClick={logout} sx={styles.logoutButton}>
              <ListItemIcon sx={styles.logoutIcon}><LogoutIcon /></ListItemIcon>
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
  logoToolbar: { display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2 },
  logoIcon: { color: 'text.primary', fontSize: 20 },
  logoText: { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' },
  navItemsList: { flexGrow: 1, px: 2, py: 1.5 },
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
  logoutBox: { p: 2 },
  logoutButton: {
    borderRadius: '12px',
    py: 1.2,
    px: 2.2,
    color: '#DC3545',
    '&:hover': { bgcolor: 'rgba(220,53,69,0.08)', color: '#C82333' },
  },
  logoutIcon: { minWidth: 36, color: 'inherit' },
  logoutText: { '& .MuiListItemText-primary': { fontWeight: 600, fontSize: '0.925rem' } },
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
