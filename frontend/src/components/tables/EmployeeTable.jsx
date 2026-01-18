import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Pagination,
  TablePagination,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Tooltip,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  Badge,
  Fab,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  FilterList,
  Visibility,
  GetApp,
  Refresh,
  Person,
  GroupAdd,
  PictureAsPdf,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  Business,
  PersonAdd,
  MoreVert,
  Menu as MenuIcon,
  Diamond,
  Shield,
  Verified,
  Star,
  WorkspacePremium,
  BusinessCenter,
  MilitaryTech,
  Badge as BadgeIcon,
  Fingerprint,
  PersonPin,
  ContactMail,
  AccountCircle,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getEmployes, createEmploye, updateEmploye, deleteEmploye, bulkUpdateEmployes } from '../../api';
import { useDebounce } from '../../hooks/useDebounce';
import EmployeeForm from '../forms/EmployeeForm';

const EmployeeTable = ({
  onEdit,
  onDelete,
  onView,
  refreshTrigger,
  showBulkActions
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [openViewModal, setOpenViewModal] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  // Dynamic filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Bulk actions
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [openBulkConfirm, setOpenBulkConfirm] = useState(false);

  // Advanced features
  const [viewMode, setViewMode] = useState('table'); // table, card, compact
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    im: true,
    nom: true,
    prenom: true,
    corps: true,
    grades: true,
    sexe: true,
    types_personnel: true,
    date_naissance: true,
    date_prise_service: true,
    poste: true,
    role: true,
    created_at: true,
    updated_at: true,
    actions: true
  });

  const theme = useTheme();

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Additional state variables
  const [filters, setFilters] = useState({ sexe: '', corps: '', grades: '', types_personnel: '', role: '' });
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkValue, setBulkValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Helper functions
  const getRoleLabel = (role) => {
    const roleLabels = {
      'admin': 'Administrateur',
      'rh': 'Ressources Humaines',
      'employe': 'Employé',
      'responsable': 'Responsable'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': theme.palette.error.main,
      'rh': theme.palette.warning.main,
      'responsable': theme.palette.info.main,
      'employe': theme.palette.success.main
    };
    return colors[role] || theme.palette.primary.main;
  };

  const getSexeColor = (sexe) => {
    return sexe === 'M' ? theme.palette.primary.main : theme.palette.secondary.main;
  };

  const getInitials = (nom, prenom) => {
    if (!nom || !prenom) return 'EP';
    return `${prenom.charAt(0).toUpperCase()}${nom.charAt(0).toUpperCase()}`;
  };

  const getEmailFromName = (nom, prenom) => {
    if (!nom || !prenom) return 'email@entreprise.com';
    const formattedNom = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const formattedPrenom = prenom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${formattedPrenom}.${formattedNom}@entreprise.com`;
  };

  const getRoleIcon = (role) => {
    const icons = {
      'admin': <Shield fontSize="small" />,
      'rh': <GroupAdd fontSize="small" />,
      'responsable': <BusinessCenter fontSize="small" />,
      'employe': <Person fontSize="small" />
    };
    return icons[role] || <Person fontSize="small" />;
  };

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, sortBy, sortDirection]);

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedEmployees(employees && Array.isArray(employees) ? employees.map(employee => employee.id) : []);
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleEmployeeExpansion = (employeeId) => {
    setExpandedEmployeeId(expandedEmployeeId === employeeId ? null : employeeId);
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedEmployees.length === 0) return;

    try {
      setLoading(true);
      switch (bulkAction) {
        case 'delete':
          await bulkUpdateEmployes({ employe_ids: selectedEmployees, action: 'delete' });
          showToast(`${selectedEmployees.length} employés supprimés`);
          break;
        case 'update_corps':
          await bulkUpdateEmployes({ employe_ids: selectedEmployees, action: 'update_corps', value: bulkValue });
          showToast(`${selectedEmployees.length} employés mis à jour`);
          break;
        case 'update_grades':
          await bulkUpdateEmployes({ employe_ids: selectedEmployees, action: 'update_grades', value: bulkValue });
          showToast(`${selectedEmployees.length} employés mis à jour`);
          break;
        case 'update_poste':
          await bulkUpdateEmployes({ employe_ids: selectedEmployees, action: 'update_poste', value: bulkValue });
          showToast(`${selectedEmployees.length} employés mis à jour`);
          break;
        case 'update_role':
          await bulkUpdateEmployes({ employe_ids: selectedEmployees, action: 'update_role', value: bulkValue });
          showToast(`${selectedEmployees.length} employés mis à jour`);
          break;
        default:
          break;
      }
      setSelectedEmployees([]);
      setBulkAction('');
      setBulkValue('');
      setBulkActionDialog(false);
      await fetchEmployees();
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('Erreur lors de l\'action groupée', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const exportData = {
        search: searchTerm,
        sort_by: sortBy,
        sort_direction: sortDirection,
        format
      };

      const csvContent = (employees && Array.isArray(employees) ? employees : []).map(employee =>
        `${employee.id},${employee.nom},${employee.prenom},${employee.im},${employee.role}`
      ).join('\n');

      const blob = new Blob([`ID,Nom,Prénom,IM,Rôle\n${csvContent}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employes_${new Date().toISOString().split('T')[0]}.csv`;
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
    fetchEmployees();
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return [];
    return employees.filter(employee => {
      const matchesSearch = !debouncedSearchTerm ||
        employee.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        employee.prenom.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        employee.im.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [employees, debouncedSearchTerm]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    fetchEmployees();
  };

  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newPerPage);
    setPage(0);
    fetchEmployees();
  };

  const clearFilters = () => {
    setSearchTerm('');
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
  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      await deleteEmploye(selectedEmployee.id);
      showToast('Employé supprimé avec succès');
      fetchEmployees();
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
      setOpenConfirm(false);
      setSelectedEmployee(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setSelectedEmployee(null);
  };

  // Toast notifications
  const showToast = (message, severity = 'success') => {
    enqueueSnackbar(message, { variant: severity });
  };

  // View handler
  const handleViewClick = async (employee) => {
    setSelectedEmployee(employee);
    setLoadingDetails(true);
    setOpenViewModal(true);

    try {
      setEmployeeDetails(employee);
    } catch (error) {
      showToast('Erreur lors du chargement des détails employé', 'error');
      setEmployeeDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Search handler
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Sort handler
  const handleSort = (field) => {
    setOrderBy(field);
    setOrder(order === 'asc' ? 'desc' : 'asc');
    setSortBy(field);
    setSortDirection(order === 'asc' ? 'desc' : 'asc');
    fetchEmployees();
  };

  // Edit handler
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setOpenEditModal(true);
  };

  // Fetch employees function
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm,
        sort_by: sortBy,
        sort_direction: sortDirection,
        page: page + 1,
        per_page: rowsPerPage
      };

      const response = await getEmployes(params);

      let employeesData = [];
      let paginationData = {};

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          employeesData = response.data;
          paginationData = {
            current_page: response.current_page || 1,
            per_page: response.per_page || 10,
            total: response.total || response.data.length,
            last_page: response.last_page || 1
          };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
          paginationData = {
            current_page: response.data.current_page || 1,
            per_page: response.data.per_page || 10,
            total: response.data.total || 0,
            last_page: response.data.last_page || 1
          };
        }
      }

      setEmployees(employeesData);
      setPagination(paginationData);
      setTotal(paginationData.total || 0);

      if (employeesData.length === 0 && !loading) {
        showToast('Aucun employé trouvé', 'info');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des employés';
      showToast(errorMessage, 'error');
      setError(errorMessage);
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      width: '100%',
      p: 3,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessCenter sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Gestion des Employés
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gérez et suivez tous les employés avec interface
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Search and Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 2, 
          position: 'relative',
          zIndex: 1
        }}>
          <TextField
            variant="outlined"
            placeholder="Rechercher par nom, prénom ou IM..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtres
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchEmployees}
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
              onClick={() => setOpenCreateModal(true)}
            >
              <PersonAdd />
            </Fab>
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 120,
                  '& .MuiInputBase-root': { 
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
              >
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sexe</InputLabel>
                <Select
                  value={filters.sexe}
                  onChange={(e) => handleFilterChange('sexe', e.target.value)}
                  label="Sexe"
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="M">Masculin</MenuItem>
                  <MenuItem value="F">Féminin</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Corps"
                value={filters.corps}
                onChange={(e) => handleFilterChange('corps', e.target.value)}
                sx={{ 
                  minWidth: 120,
                  '& .MuiInputBase-root': { 
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />

              <TextField
                size="small"
                label="Grades"
                value={filters.grades}
                onChange={(e) => handleFilterChange('grades', e.target.value)}
                sx={{ 
                  minWidth: 120,
                  '& .MuiInputBase-root': { 
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />

              <TextField
                size="small"
                label="Type Personnel"
                value={filters.types_personnel}
                onChange={(e) => handleFilterChange('types_personnel', e.target.value)}
                sx={{ 
                  minWidth: 120,
                  '& .MuiInputBase-root': { 
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />

              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 120,
                  '& .MuiInputBase-root': { 
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
              >
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Rôle</InputLabel>
                <Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  label="Rôle"
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="rh">RH</MenuItem>
                  <MenuItem value="responsable">Responsable</MenuItem>
                  <MenuItem value="employe">Employé</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Loading/Error states */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Premium Employee Table */}
      {!loading && !error && (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ 
                background: alpha(theme.palette.primary.main, 0.08),
                '& th': { 
                  fontWeight: 'bold',
                  color: theme.palette.primary.dark,
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}>
                {showBulkActions && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < employees.length}
                      checked={employees.length > 0 && selectedEmployees.length === employees.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                <TableCell>PROFIL</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>IM</TableCell>
                <TableCell>NOM</TableCell>
                <TableCell>PRÉNOM</TableCell>
                <TableCell>CORPS</TableCell>
                <TableCell>GRADES</TableCell>
                <TableCell>SEXE</TableCell>
                <TableCell>POSTE</TableCell>
                <TableCell>RÔLE</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees && Array.isArray(employees) && employees.length > 0 ? employees.map((employee) => (
                <React.Fragment key={employee.id}>
                  <TableRow
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        cursor: 'pointer'
                      },
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                    onClick={() => toggleEmployeeExpansion(employee.id)}
                  >
                    {showBulkActions && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectEmployee(employee.id);
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: getRoleColor(employee.role),
                            width: 40,
                            height: 40,
                            mr: 2,
                            border: `2px solid ${getSexeColor(employee.sexe)}`
                          }}
                        >
                          {getInitials(employee.nom, employee.prenom)}
                          {employee.role === 'admin' && (
                            <Star
                              sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: -4,
                                fontSize: 14,
                                color: theme.palette.warning.main,
                                background: 'white',
                                borderRadius: '50%',
                                padding: 0.3
                              }}
                            />
                          )}
                        </Avatar>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEmployeeExpansion(employee.id);
                          }}
                        >
                          {expandedEmployeeId === employee.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`#${employee.id}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Fingerprint sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {employee.im}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {employee.nom}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.prenom}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.corps || 'N/A'}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.grades || 'N/A'}
                        size="small"
                        color="primary"
                        variant="filled"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.sexe === 'M' ? 'Masculin' : 'Féminin'}
                        size="small"
                        color={employee.sexe === 'M' ? 'primary' : 'secondary'}
                        variant="filled"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.poste || 'Non spécifié'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(employee.role)}
                        label={getRoleLabel(employee.role)}
                        size="small"
                        sx={{ 
                          borderRadius: 1,
                          bgcolor: getRoleColor(employee.role),
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {onView && (
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(employee);
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
                        )}
                        {onEdit && (
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(employee);
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
                        {onDelete && (
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(employee);
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

                  {/* Expanded Profile Section */}
                  {expandedEmployeeId === employee.id && (
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell colSpan={showBulkActions ? 12 : 11} sx={{ py: 3, px: 4 }}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                            borderLeft: `4px solid ${getRoleColor(employee.role)}`
                          }}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 2,
                                    mx: 'auto',
                                    bgcolor: getRoleColor(employee.role),
                                    border: `3px solid ${getSexeColor(employee.sexe)}`
                                  }}
                                >
                                  {getInitials(employee.nom, employee.prenom)}
                                  {employee.role === 'admin' && (
                                    <Verified
                                      sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        fontSize: 24,
                                        color: theme.palette.warning.main,
                                        background: 'white',
                                        borderRadius: '50%',
                                        padding: 0.5
                                      }}
                                    />
                                  )}
                                </Avatar>
                                
                                {/* Profil Info - Nom, Prénom et Email */}
                                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'white' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                      {employee.prenom} {employee.nom}
                                    </Typography>
                                  </Box>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ContactMail sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {getEmailFromName(employee.nom, employee.prenom)}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Chip
                                  icon={getRoleIcon(employee.role)}
                                  label={getRoleLabel(employee.role)}
                                  size="small"
                                  sx={{ 
                                    mt: 2,
                                    borderRadius: 1,
                                    bgcolor: getRoleColor(employee.role),
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={9}>
                              <Box sx={{ pl: { md: 3 } }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                                  Détails de l'Employé
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        ID Employé:
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 3 }}>
                                      {employee.id}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Fingerprint sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Matricule (IM):
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 3, fontWeight: 600 }}>
                                      {employee.im}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Work sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Corps:
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 3 }}>
                                      {employee.corps || 'Non spécifié'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <MilitaryTech sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Grades:
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 3 }}>
                                      {employee.grades || 'Non spécifié'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <PersonPin sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Poste:
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 3 }}>
                                      {employee.poste || 'Non spécifié'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Date Prise Service:
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 3 }}>
                                      {employee.date_prise_service ? new Date(employee.date_prise_service).toLocaleDateString('fr-FR') : 'N/A'}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )) : (
                <TableRow>
                  <TableCell colSpan={showBulkActions ? 12 : 11} sx={{ textAlign: 'center', py: 8 }}>
                    <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucun employé trouvé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Essayez de modifier vos critères de recherche
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Premium Pagination */}
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
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
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

      {/* Modals remain the same as before */}
      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialog}
        onClose={() => setBulkActionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Actions en masse</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              label="Action"
            >
              <MenuItem value="update_corps">Mettre à jour le corps</MenuItem>
              <MenuItem value="update_grades">Mettre à jour les grades</MenuItem>
              <MenuItem value="update_poste">Mettre à jour le poste</MenuItem>
              <MenuItem value="update_role">Mettre à jour le rôle</MenuItem>
              <MenuItem value="delete">Supprimer</MenuItem>
            </Select>
          </FormControl>

          {bulkAction && bulkAction !== 'delete' && (
            <TextField
              fullWidth
              label="Nouvelle valeur"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
          )}

          {bulkAction === 'delete' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Attention: Cette action supprimera définitivement {selectedEmployees.length} employés.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Annuler</Button>
          <Button
            onClick={handleBulkAction}
            variant="contained"
            color={bulkAction === 'delete' ? 'error' : 'primary'}
            disabled={!bulkAction || (bulkAction !== 'delete' && !bulkValue)}
          >
            Appliquer
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
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Détails de l'employé</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdf />}
              onClick={() => {
                enqueueSnackbar('Fonctionnalité d\'export PDF à venir', { variant: 'info' });
              }}
            >
              Exporter PDF
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>Chargement des détails...</Typography>
            </Box>
          ) : employeeDetails ? (
            <Box>
              {/* Employee Information */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Informations de l'Employé
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="ID"
                  value={employeeDetails.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="IM"
                  value={employeeDetails.im || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Nom"
                  value={employeeDetails.nom || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Prénom"
                  value={employeeDetails.prenom || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Corps"
                  value={employeeDetails.corps || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Grades"
                  value={employeeDetails.grades || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Sexe"
                  value={employeeDetails.sexe === 'M' ? 'Masculin' : 'Féminin'}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Type de Personnel"
                  value={employeeDetails.types_personnel || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Date de Naissance"
                  value={employeeDetails.date_naissance ? new Date(employeeDetails.date_naissance).toLocaleDateString('fr-FR') : ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Date de Prise de Service"
                  value={employeeDetails.date_prise_service ? new Date(employeeDetails.date_prise_service).toLocaleDateString('fr-FR') : ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Poste"
                  value={employeeDetails.poste || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Rôle"
                  value={employeeDetails.role ? employeeDetails.role.charAt(0).toUpperCase() + employeeDetails.role.slice(1) : ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Date de création"
                  value={employeeDetails.created_at ? new Date(employeeDetails.created_at).toLocaleDateString('fr-FR') : ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
                <TextField
                  fullWidth
                  label="Dernière mise à jour"
                  value={employeeDetails.updated_at ? new Date(employeeDetails.updated_at).toLocaleDateString('fr-FR') : ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Box>
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
            setEmployeeDetails(null);
          }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Modifier l'employé
        </DialogTitle>
        <DialogContent>
          {editingEmployee && (
            <EmployeeForm
              initialData={editingEmployee}
              onSuccess={(employeeData) => {
                setOpenEditModal(false);
                setEditingEmployee(null);
                fetchEmployees();
              }}
              onError={(error) => {
                // Error handling is done in the form component
              }}
              onCancel={() => setOpenEditModal(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Employee Modal */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Nouvel employé
        </DialogTitle>
        <DialogContent>
          <EmployeeForm
            onSuccess={(employeeData) => {
              setOpenCreateModal(false);
              fetchEmployees();
            }}
            onError={(error) => {
              // Error handling is done in the form component
            }}
            onCancel={() => setOpenCreateModal(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeeTable;