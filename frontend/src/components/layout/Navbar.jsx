import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Chip,
  Divider,
  Badge,
  Tooltip,
  InputBase,
  alpha,
  styled,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  ClickAwayListener,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AccountCircle,
  ExitToApp,
  Menu as MenuIcon,
  Login as LoginIcon,
  BusinessCenter,
  Notifications,
  Settings,
  Help,
  Search as SearchIcon,
  Dashboard,
  CalendarMonth,
  People,
  Assignment,
  Logout,
  Person,
  AdminPanelSettings,
  NotificationsActive,
  NotificationsNone,
  Brightness4,
  Brightness7,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';

const logo = '/logo.png';

// Barre de recherche stylée
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: 400,
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '300px',
    },
  },
}));

const Navbar = ({ onToggleSidebar, onToggleTheme, darkMode }) => {
  const { user, logout, notifications = [], unreadNotifications = 0 } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoadingLogout(false);
      handleClose();
    }
  };

  const handleProfile = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}/profile`);
    }
    handleClose();
  };

  const handleDashboard = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    }
    handleClose();
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      'ADMIN': 'Administrateur',
      'RESPONSABLE': 'Responsable',
      'RH': 'RH',
      'EMPLOYÉ': 'Employé',
      'MANAGER': 'Manager',
    };
    return roles[role] || role;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <AdminPanelSettings fontSize="small" />;
      case 'RESPONSABLE':
      case 'RH':
      case 'MANAGER':
        return <People fontSize="small" />;
      default:
        return <Person fontSize="small" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return '#ff3d00';
      case 'RESPONSABLE':
      case 'RH':
      case 'MANAGER':
        return '#1976d2';
      default:
        return '#2e7d32';
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    handleNotificationClose();
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: darkMode 
          ? 'linear-gradient(135deg, #0a1929 0%, #132f4c 50%, #1e3a8a 100%)'
          : 'linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #3f51b5 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.05)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {loadingLogout && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            height: 2,
            backgroundColor: 'transparent',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #ff3d00 0%, #ff9800 100%)',
            }
          }} 
        />
      )}
      
      <Toolbar sx={{ minHeight: 70, px: { xs: 2, sm: 3 } }}>
        {onToggleSidebar && (
          <Tooltip title="Menu">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onToggleSidebar}
              sx={{
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Logo and Title Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 4,
            cursor: 'pointer',
            '&:hover': {
              '& img': {
                transform: 'rotate(-5deg) scale(1.05)',
              }
            }
          }}
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              height: 44,
              width: 44,
              mr: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: darkMode 
                ? '2px solid rgba(100, 181, 246, 0.3)' 
                : '2px solid rgba(255, 255, 255, 0.3)',
              p: 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease',
            }}
          />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.4rem' },
                fontWeight: 800,
                background: darkMode
                  ? 'linear-gradient(45deg, #64b5f6 0%, #bb86fc 100%)'
                  : 'linear-gradient(45deg, #ffffff 0%, #e3f2fd 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}
            >
              Gestion des congés  
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'block',
                mt: -0.5,
              }}
            >
              Système Professionnel
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Barre de recherche - visible uniquement pour les utilisateurs connectés */}
        {user && (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Rechercher…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
            />
          </Search>
        )}

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Bouton changement de thème */}
            <Tooltip title={darkMode ? "Mode clair" : "Mode sombre"}>
              <IconButton
                size="medium"
                color="inherit"
                onClick={onToggleTheme}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(15deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                size="medium"
                color="inherit"
                onClick={handleNotificationMenu}
                sx={{
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Badge
                  badgeContent={unreadNotifications}
                  color="error"
                  variant="dot"
                  invisible={unreadNotifications === 0}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.6rem',
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                >
                  {unreadNotifications > 0 ? (
                    <NotificationsActive />
                  ) : (
                    <NotificationsNone />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 320,
                  maxWidth: 400,
                  maxHeight: 400,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  '& .MuiList-root': {
                    py: 0,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {unreadNotifications} non lues
                </Typography>
              </Box>
              
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <MenuItem
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                        borderLeft: notification.unread 
                          ? '3px solid #1976d2' 
                          : '3px solid transparent',
                      }}
                    >
                      <ListItemIcon>
                        {notification.icon || <Notifications fontSize="small" />}
                      </ListItemIcon>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: notification.unread ? 600 : 400 }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {formatNotificationTime(notification.date)}
                        </Typography>
                      </Box>
                      <ChevronRight fontSize="small" color="action" />
                    </MenuItem>
                    {index < notifications.length - 1 && (
                      <Divider variant="middle" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                  <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    Aucune notification
                  </Typography>
                </Box>
              )}
              
              {notifications.length > 5 && (
                <>
                  <Divider />
                  <MenuItem onClick={() => navigate('/notifications')}>
                    <ListItemText 
                      primary="Voir toutes les notifications" 
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'primary',
                        textAlign: 'center',
                      }}
                    />
                  </MenuItem>
                </>
              )}
            </Menu>

            {/* User Info avec Tooltip */}
            <Tooltip title="Mon profil">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={handleMenu}
              >
                <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    {getRoleIcon(user.role)}
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: getRoleColor(user.role) + '30',
                        color: getRoleColor(user.role),
                        border: `1px solid ${getRoleColor(user.role)}50`,
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: getRoleColor(user.role),
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                
                <ExpandMore 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    transition: 'transform 0.2s ease',
                    transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} 
                />
              </Box>
            </Tooltip>

            {/* Menu utilisateur */}
            <ClickAwayListener onClickAway={handleClose}>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 240,
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                      borderLeft: '1px solid rgba(0, 0, 0, 0.05)',
                      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>

                <MenuItem onClick={handleDashboard}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Tableau de bord" />
                </MenuItem>

                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Mon profil" />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem onClick={() => navigate('/help')}>
                  <ListItemIcon>
                    <Help fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Aide & Support" />
                </MenuItem>

                <MenuItem onClick={() => navigate('/settings')}>
                  <ListItemIcon>
                    <Settings fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Paramètres" />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem 
                  onClick={handleLogout}
                  disabled={loadingLogout}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={loadingLogout ? "Déconnexion..." : "Déconnexion"} 
                  />
                </MenuItem>
              </Menu>
            </ClickAwayListener>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              color="inherit"
              onClick={() => navigate('/help')}
              sx={{
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Aide
            </Button>
            
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(45deg, #2196f3 0%, #21cbf3 100%)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 0%, #1ba1d2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Se connecter
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;