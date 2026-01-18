import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Badge
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open = true, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'RESPONSABLE':
      case 'RH':
        return 'Responsable RH';
      case 'EMPLOYÉ':
        return 'Employé';
      default:
        return role;
    }
  };

  const menuItems = [];
  if (user?.role === 'employe') {
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/employee/dashboard', description: 'Aperçu et statistiques' },
      { text: 'Soldes', icon: <AccountBalanceIcon />, path: '/employee/balances', description: 'Mes soldes de congé' },
      { text: 'Mes Demandes', icon: <EventNoteIcon />, path: '/employee/requests', description: 'Historique de mes demandes' },
      { text: 'Détails', icon: <CheckCircleIcon />, path: '/employee/details', description: 'Informations personnelles' }
    );
  } else if (user?.role === 'rh' || user?.role === 'RESPONSABLE') {
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/rh/dashboard', description: 'Tableau de bord RH' },
      { text: 'Employés', icon: <GroupIcon />, path: '/rh/employees', description: 'Gestion des employés' },
      { text: 'Validation', icon: <CheckCircleIcon />, path: '/rh/validation', description: 'Validation des demandes' },
      { text: 'Rapports', icon: <FileDownloadIcon />, path: '/rh/reports', description: 'Historique des congés et absences' },
      { text: 'Statistiques', icon: <AssessmentIcon />, path: '/rh/statistics', description: 'Rapports et analyses' }
    );
  } else if (user?.role === 'admin') {
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', description: 'Aperçu général du système' },
      { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users', description: 'Gestion des utilisateurs' },
      { text: 'Gestion des Employés', icon: <GroupIcon />, path: '/admin/employees', description: 'Gestion des employés' },
      { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings', description: 'Configuration système' },
      { text: 'Supervision', icon: <CheckCircleIcon />, path: '/admin/requests', description: 'Supervision des demandes' },
      { text: 'Rapports', icon: <FileDownloadIcon />, path: '/admin/reports', description: 'Rapports et analyses' }
    );
  }

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <Box sx={{ p: open ? 2 : 1 }}>
      {/* User Profile Section */}
      {open && user && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 1,
              bgcolor: 'rgba(45, 135, 224, 0.2)',
              border: '2px solid rgba(45, 135, 224, 0.4)',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(45, 135, 224, 0.3)',
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {user.name}
          </Typography>
          <Chip
            label={getRoleLabel(user.role)}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              mt: 0.5,
            }}
          />
        </Box>
      )}

      <List sx={{ px: open ? 1 : 0.5 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: open ? 1 : 0.5,
                  px: open ? 2 : 1,
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: open ? 'translateX(4px)' : 'none',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    },
                    '&::before': open ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: 'white',
                      borderRadius: '0 2px 2px 0',
                    } : {},
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: 'white',
                  minWidth: open ? 40 : 'auto',
                  mr: open ? 2 : 0,
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    />
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          fontSize: '0.75rem',
                          lineHeight: 1.2,
                          mt: 0.5,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Collapse>
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mt: 2 }} />
      <List sx={{ px: open ? 1 : 0.5 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              mx: open ? 1 : 0.5,
              px: open ? 2.5 : 1,
              py: 1.5,
              minHeight: 56,
              justifyContent: open ? 'initial' : 'center',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.8) 100%)',
                transform: open ? 'translateX(6px) scale(1.02)' : 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                '& .MuiListItemIcon-root': {
                  transform: 'scale(1.1)',
                },
              },
            }}
          >
            <ListItemIcon sx={{
              color: 'white',
              minWidth: open ? 40 : 'auto',
              mr: open ? 2 : 0,
              justifyContent: 'center'
            }}>
              <ExitToAppIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Déconnexion"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 400,
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? 320 : 72,
        flexShrink: 0,
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? 320 : 72,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0f1419 0%, #1a1a2e 30%, #16213e 70%, #0f3460 100%)',
          color: 'white',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          top: '70px',
          height: 'calc(100vh - 70px)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            pointerEvents: 'none',
          },
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
