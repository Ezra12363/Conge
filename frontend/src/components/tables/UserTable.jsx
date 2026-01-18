import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  TablePagination,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Typography,
  Box,
  LinearProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Divider,
  Fab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit,
  Delete,
  LockReset,
  Block,
  CheckCircle,
  Visibility,
  FilterList,
  Search,
  Clear,
  Sort,
  GetApp,
  PictureAsPdf,
  Refresh,
  Person,
  Email,
  CalendarToday,
  PersonAdd,
  MoreVert,
  AdminPanelSettings,
  Groups,
  Badge,
  Diamond,
  Star,
  Verified,
  Shield,
  WorkspacePremium
} from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  onUsersChange,
  pagination,
  onPaginationChange,
  onCreate
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [openViewModal, setOpenViewModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);


  // Dynamic filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Advanced features
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const theme = useTheme();

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Helper functions for user-friendly display
  const getRoleLabel = (role) => {
    const roleLabels = {
      'admin': 'Administrateur',
      'rh': 'Ressources Humaines',
      'employe': 'Employé'
    };
    return roleLabels[role] || role;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return statusLabels[status] || status;
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      'admin': <AdminPanelSettings fontSize="small" />,
      'rh': <Groups fontSize="small" />,
      'employe': <Badge fontSize="small" />
    };
    return roleIcons[role] || <Person fontSize="small" />;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (role) => {
    const colors = {
      'admin': theme.palette.error.main,
      'rh': theme.palette.warning.main,
      'employe': theme.palette.info.main
    };
    return colors[role] || theme.palette.primary.main;
  };

  const getUserStatusColor = (status) => {
    return status === 'active' ? theme.palette.success.main : theme.palette.error.main;
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange();
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, roleFilter, statusFilter, sortBy, sortDirection]);

  // Export functionality
  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const exportData = {
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sort_by: sortBy,
        sort_direction: sortDirection,
        format
      };

      const csvContent = users.map(user =>
        `${user.id},${user.name},${user.email},${user.role},${user.status}`
      ).join('\n');

      const blob = new Blob([`ID,Nom,Email,Rôle,Statut\n${csvContent}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast('Export réussi');
    } catch (error) {
      showToast('Erreur lors de l\'export', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    if (onUsersChange) {
      onUsersChange({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sort_by: sortBy,
        sort_direction: sortDirection,
        page: pagination?.current_page || 1
      });
    }
  };

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !debouncedSearchTerm ||
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearchTerm, roleFilter, statusFilter]);

  const handleFilterChange = () => {
    const filters = {
      search: searchTerm,
      role: roleFilter,
      status: statusFilter,
      sort_by: sortBy,
      sort_direction: sortDirection,
      page: 1
    };

    if (onUsersChange) {
      onUsersChange(filters);
    }
  };

  const handlePageChange = (event, newPage) => {
    if (onPaginationChange) {
      onPaginationChange({ ...pagination, current_page: newPage + 1 });
    }
  };

  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    if (onPaginationChange) {
      onPaginationChange({
        ...pagination,
        per_page: newPerPage,
        current_page: 1
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setSortBy('id');
    setSortDirection('asc');
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Confirmation dialog
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    if (onDelete && selectedUser) {
      onDelete(selectedUser.id);
    }
    setOpenConfirm(false);
    setSelectedUser(null);
  };
  
  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setSelectedUser(null);
  };

  // Toast notifications
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };
  
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Action handlers
  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setOpenPasswordModal(true);
  };

  const handleResetPasswordConfirm = async () => {
    if (!newPassword.trim()) {
      showToast('Veuillez saisir un nouveau mot de passe', 'warning');
      return;
    }

    try {
      if (onResetPassword) {
        const response = await onResetPassword(selectedUser.id);
        showToast(`Mot de passe réinitialisé pour ${selectedUser.name}`);
        setOpenPasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
      }
    } catch (error) {
      showToast('Erreur lors de la réinitialisation du mot de passe', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (onToggleStatus) {
        await onToggleStatus(user.id);
        showToast(`Statut de ${user.name} mis à jour`);
      }
    } catch (error) {
      showToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleViewClick = async (user) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setOpenViewModal(true);

    try {
      setUserDetails(user);
    } catch (error) {
      showToast('Erreur lors du chargement des détails utilisateur', 'error');
      setUserDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };



  return (
    <Box sx={{
      width: '100%',
      p: 3,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Gestion des Utilisateurs
        </Typography>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <TextField
            variant="outlined"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={roleFilter}
                label="Rôle"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="rh">RH</MenuItem>
                <MenuItem value="employe">Employé</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Actualiser
            </Button>

            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={handleExport}
            >
              Exporter
            </Button>

            <Fab
              color="primary"
              size="medium"
              onClick={() => {
                if (onCreate) {
                  onCreate();
                }
              }}
            >
              <PersonAdd />
            </Fab>
          </Box>
        </Box>
      </Box>

      {/* Loading/Error states */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* User Table */}
      {!loading && (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{
                '& th': {
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}>
                <TableCell>ID</TableCell>
                <TableCell>PROFIL</TableCell>
                <TableCell>RÔLE</TableCell>
                <TableCell>STATUT</TableCell>
                <TableCell>CRÉÉ LE</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                    <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucun utilisateur trouvé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Essayez de modifier vos critères de recherche
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <TableRow
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04)
                        },
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={`#${user.id}`}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(user.role),
                              width: 48,
                              height: 48,
                              border: `2px solid ${getUserStatusColor(user.status)}`,
                              position: 'relative'
                            }}
                          >
                            {getInitials(user.name)}
                            {user.role === 'admin' && (
                              <Star
                                sx={{
                                  position: 'absolute',
                                  bottom: -4,
                                  right: -4,
                                  fontSize: 16,
                                  color: theme.palette.warning.main,
                                  background: 'white',
                                  borderRadius: '50%',
                                  padding: 0.5
                                }}
                              />
                            )}
                          </Avatar>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              <Person sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                              {user.name}
                            </Typography>
                            {user.employee && (
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                <Badge sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                {user.employee.prenom}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              <Email sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={getRoleLabel(user.role)}
                          size="small"
                          color={
                            user.role === 'admin' ? 'error' :
                            user.role === 'rh' ? 'warning' : 'primary'
                          }
                          variant="filled"
                          sx={{ borderRadius: 1, fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(user.status)}
                          size="small"
                          color={user.status === 'active' ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ 
                            borderRadius: 1,
                            borderWidth: 2,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(user);
                              }}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'transform 0.2s'
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {onEdit && (
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(user);
                                }}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onResetPassword && (
                            <Tooltip title="Réinitialiser mot de passe">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetPasswordClick(user);
                                }}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <LockReset />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onToggleStatus && (
                            <Tooltip title={user.status === 'active' ? 'Désactiver' : 'Activer'}>
                              <IconButton
                                size="small"
                                color={user.status === 'active' ? 'warning' : 'success'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(user);
                                }}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: user.status === 'active' 
                                      ? alpha(theme.palette.warning.main, 0.1)
                                      : alpha(theme.palette.success.main, 0.1),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'transform 0.2s'
                                }}
                              >
                                {user.status === 'active' ? <Block /> : <CheckCircle />}
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(user);
                                }}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>

                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Pagination */}
      {pagination && (
        <Paper 
          elevation={0}
          sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 3,
            background: alpha(theme.palette.primary.main, 0.05)
          }}
        >
          <TablePagination
            component="div"
            count={pagination.total || 0}
            page={pagination.current_page ? pagination.current_page - 1 : 0}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.per_page || 15}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 15, 25, 50]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: theme.palette.primary.main,
                fontWeight: 500
              }
            }}
          />
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={openConfirm} 
        onClose={handleCancelDelete}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer <strong>{selectedUser?.name}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Annuler</Button>
          <Button 
            color="error" 
            onClick={handleConfirmDelete}
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog 
        open={openPasswordModal} 
        onClose={() => setOpenPasswordModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Entrez un nouveau mot de passe pour <strong>{selectedUser?.name}</strong>.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nouveau mot de passe"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Le mot de passe doit contenir au moins 8 caractères"
          />
          <DialogContentText sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
            Le mot de passe sera hashé et stocké de manière sécurisée. L'utilisateur devra changer son mot de passe lors de sa prochaine connexion.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
          }}>
            Annuler
          </Button>
          <Button
            onClick={handleResetPasswordConfirm}
            variant="contained"
            color="primary"
            disabled={!newPassword.trim() || newPassword.length < 8}
          >
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog 
        open={openViewModal} 
        onClose={() => setOpenViewModal(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            minHeight: '70vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Détails de l'utilisateur</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdf />}
              onClick={() => {
                showToast('Fonctionnalité d\'export PDF à venir', 'info');
              }}
            >
              Exporter PDF
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Chargement des détails...</Typography>
            </Box>
          ) : userDetails ? (
            <Box>
              {/* User Account Information */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Informations du Compte Utilisateur
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ID"
                    value={userDetails.id || ''}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={userDetails.name || ''}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userDetails.email || ''}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rôle"
                    value={userDetails.role || ''}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Statut"
                    value={userDetails.status || ''}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de création"
                    value={userDetails.created_at ? new Date(userDetails.created_at).toLocaleDateString('fr-FR') : ''}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
              </Grid>

              {/* Employee Information */}
              {userDetails.employee && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Informations Employé
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={userDetails.employee.prenom || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="IM"
                        value={userDetails.employee.im || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Corps"
                        value={userDetails.employee.corps || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Grades"
                        value={userDetails.employee.grades || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sexe"
                        value={userDetails.employee.sexe || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Type de Personnel"
                        value={userDetails.employee.types_personnel || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date de Naissance"
                        value={userDetails.employee.date_naissance ? new Date(userDetails.employee.date_naissance).toLocaleDateString('fr-FR') : ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date de Prise de Service"
                        value={userDetails.employee.date_prise_service ? new Date(userDetails.employee.date_prise_service).toLocaleDateString('fr-FR') : ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Poste"
                        value={userDetails.employee.poste || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>Erreur lors du chargement des données</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenViewModal(false);
            setUserDetails(null);
            setSelectedUser(null);
          }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for toasts */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserTable;