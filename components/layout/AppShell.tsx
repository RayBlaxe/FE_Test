'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 260;

type AppShellProps = {
  title?: string;
  children: React.ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  function handleLogout() {
    localStorage.removeItem('token');
    router.replace('/login');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafb' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1d3a8d',
            borderRight: 'none',
          },
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            bgcolor: '#fefefe',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Image
            src="/jasamarga-logo.png"
            alt="Jasa Marga Logo"
            width={60}
            height={16}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>

        {/* Navigation */}
        <List sx={{ mt: 2, px: 2 }}>
          <ListItemButton
            component={Link}
            href="/dashboard"
            selected={isActive('/dashboard')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                bgcolor: '#fefefe',
                color: '#1d3a8d',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
                '& .MuiListItemIcon-root': {
                  color: '#1d3a8d',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: isActive('/dashboard') ? 600 : 500 
              }} 
            />
          </ListItemButton>

          <ListItemButton
            component={Link}
            href="/reports"
            selected={isActive('/reports')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                bgcolor: '#fefefe',
                color: '#1d3a8d',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
                '& .MuiListItemIcon-root': {
                  color: '#1d3a8d',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AssessmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Laporan Lalin" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: isActive('/reports') ? 600 : 500 
              }} 
            />
          </ListItemButton>

          <ListItemButton
            component={Link}
            href="/master-gate"
            selected={isActive('/master-gate')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                bgcolor: '#fefefe',
                color: '#1d3a8d',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
                '& .MuiListItemIcon-root': {
                  color: '#1d3a8d',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AccountTreeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Master Gerbang" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: isActive('/master-gate') ? 600 : 500 
              }} 
            />
          </ListItemButton>

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: '#ef4444',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ fontSize: '0.9rem' }} 
              />
            </ListItemButton>
          </Box>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{ 
            bgcolor: '#fefefe', 
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Toolbar
            sx={{
              minHeight: 72,
              height: 72,
              display: 'flex',
              justifyContent: 'space-between',
              px: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
              {title || 'Traffic Management System'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: '#1d3a8d',
                  fontSize: '0.9rem'
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            bgcolor: '#fefefe',
          }}
        >
          <Box
            sx={{
              bgcolor: '#fefefe',
              borderRadius: 3,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              p: 3,
              minHeight: 'calc(100vh - 120px)',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
