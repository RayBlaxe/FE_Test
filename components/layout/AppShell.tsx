'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';

const drawerWidth = 220;

type AppShellProps = {
  title?: string;
  children: React.ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f5f7' }}>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#d0d4db',
            borderRight: 'none',
          },
        }}
      >
        
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            borderBottom: '1px solid #bcc1ca',
          }}
        >
          <Box
            sx={{
              height: 36,
              flex: 1,
              borderRadius: 1,
              border: '1px solid #bcc1ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#e4e7ec',
            }}
          >
            <Typography variant="subtitle2">App Logo</Typography>
          </Box>
          <IconButton size="small" sx={{ ml: 1 }}>
            <ExpandMoreIcon />
          </IconButton>
        </Box>


        <List sx={{ mt: 1 }}>
          <ListItemButton
            component={Link}
            href="/dashboard"
            selected={isActive('/dashboard')}
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          
          <ListItemButton>
            <ListItemIcon>
              <TableChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Laporan Lalin" />
          </ListItemButton>

          
          <ListItemButton
            sx={{ pl: 7 }}
            component={Link}
            href="/reports"
            selected={isActive('/reports')}
          >
            <ListItemText primary="Laporan Per Hari" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            href="/master-gate"
            selected={isActive('/master-gate')}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Master Gerbang" />
          </ListItemButton>
        </List>
      </Drawer>

      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: '#c4c8d0', color: '#000' }}
        >
          <Toolbar
            sx={{
              minHeight: 56,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <IconButton>
              <PersonIcon />
            </IconButton>
            <IconButton>
              <TuneIcon />
            </IconButton>
          </Toolbar>
        </AppBar>


        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1200px',
              bgcolor: '#fff',
              borderRadius: 1,
              boxShadow: '0 0 6px rgba(15, 23, 42, 0.08)',
              p: 3,
            }}
          >
            {title && (
              <Typography variant="h6" fontWeight="bold" mb={2}>
                {title}
              </Typography>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
