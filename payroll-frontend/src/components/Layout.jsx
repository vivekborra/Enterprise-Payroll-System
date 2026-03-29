import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Avatar, IconButton,
  Divider, Tooltip, Badge, Menu, MenuItem, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard, People, EventNote, AccountBalanceWallet, Assessment,
  Settings, Logout, Menu as MenuIcon, Close, Notifications,
  AccountBalance, AdminPanelSettings, ChevronRight
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';

const DRAWER_WIDTH = 260;

const employeeNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/employee/dashboard' },
  { label: 'My Payslips', icon: <AccountBalanceWallet />, path: '/employee/payroll' },
  { label: 'Leave Management', icon: <EventNote />, path: '/employee/leaves' },
  { label: 'My Profile', icon: <Settings />, path: '/employee/profile' },
];

const hrNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/hr/dashboard' },
  { label: 'Employees', icon: <People />, path: '/hr/employees' },
  { label: 'Leave Requests', icon: <EventNote />, path: '/hr/leaves' },
  { label: 'Payroll', icon: <AccountBalanceWallet />, path: '/hr/payroll' },
  { label: 'Reports', icon: <Assessment />, path: '/hr/reports' },
];

export default function Layout() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isHr = user?.role === 'HR' || user?.role === 'ADMIN';
  const navItems = isHr ? hrNav : employeeNav;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const DrawerContent = () => (
    <Box sx={{
      height: '100%',
      background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <Box sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box sx={{
          p: 1,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
        }}>
          <AccountBalance sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography fontWeight={800} fontSize={18} color="white">PayrollPro</Typography>
          <Typography fontSize={11} color="rgba(255,255,255,0.4)">
            {isHr ? 'HR Management' : 'Employee Portal'}
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto', color: 'white' }}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.06)',
        }}>
          <Avatar sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            width: 38,
            height: 38,
            fontSize: 15,
            fontWeight: 700,
          }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontSize={13} fontWeight={600} color="white" noWrap>
              {user?.name}
            </Typography>
            <Typography fontSize={11} color="rgba(255,255,255,0.4)">
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, pt: 1.5, px: 1.5 }}>
        {navItems.map((item) => {
          const active = window.location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 1.5,
                  background: active ? 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))' : 'transparent',
                  border: active ? '1px solid rgba(102,126,234,0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.5)', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'white' : 'rgba(255,255,255,0.65)',
                  }}
                />
                {active && <ChevronRight sx={{ color: '#a78bfa', fontSize: 18 }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.2,
            color: '#f87171',
            '&:hover': { background: 'rgba(248,113,113,0.1)' },
          }}
        >
          <ListItemIcon sx={{ color: '#f87171', minWidth: 38 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: 13.5 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>
      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'rgba(13,17,23,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700} color="white" sx={{ flex: 1 }}>
              {navItems.find(n => n.path === window.location.pathname)?.label || 'Dashboard'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton>
                  <Badge badgeContent={3} color="error">
                    <Notifications sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Avatar
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 700,
                  border: '2px solid rgba(102,126,234,0.4)',
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    background: '#1a1f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    mt: 1,
                  }
                }}
              >
                <MenuItem disabled sx={{ fontSize: 13, opacity: 1 }}>
                  <Box>
                    <Typography fontSize={13} fontWeight={600}>{user?.name}</Typography>
                    <Typography fontSize={11} color="rgba(255,255,255,0.5)">{user?.email}</Typography>
                  </Box>
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#f87171', fontSize: 13 }}>
                  <Logout sx={{ fontSize: 16, mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, md: 3 },
          background: '#0d1117',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
