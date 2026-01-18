import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
  alpha,
  IconButton,
  Alert,
  Badge,
  Stack,
  Tooltip,
  Snackbar,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
  useTheme,
  InputAdornment,
  ButtonGroup,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Download,
  Visibility,
  Person,
  Email,
  Phone,
  Work,
  CalendarToday,
  LocationOn,
  Description,
  AttachFile,
  History,
  VerifiedUser,
  ArrowBack,
  PictureAsPdf,
  AccessTime,
  PriorityHigh,
  Assignment,
  ThumbUp,
  ThumbDown,
  FilterList,
  Search,
  Refresh,
  Notifications,
  FileOpen,
  CloudDownload,
  Print,
  Share,
  Groups,
  TaskAlt,
  WarningAmber,
  Info,
  Edit,
  Close,
  DateRange,
  FileCopy,
  Archive,
  Delete,
  Send,
  CheckBox,
  CheckBoxOutlineBlank,
  ViewModule,
  ViewList,
  ViewWeek,
  Apps,
  Dashboard,
  TableChart,
  GridView,
  List as ListIcon,
  Menu as MenuIcon,
  MoreHoriz,
  ExpandMore,
  ChevronRight,
  ArrowDropDown,
  ArrowDropUp,
  Sort,
  FilterAlt,
  Tune,
  ViewColumn,
  VisibilityOff,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
  RateReview,
  Comment,
  Flag,
  Label,
  Folder,
  FolderOpen,
  InsertDriveFile,
  Description as DescriptionIcon,
  Article,
  Note,
  NoteAdd,
  NoteAlt,
  StickyNote2,
  ReceiptLong,
  TextSnippet,
  DocumentScanner,
  Feed
} from '@mui/icons-material';
import { getDemandes, getEmploye, approveDemande, rejectDemande } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';

const Validation = () => {
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('en_attente');
  const [priorityRequests, setPriorityRequests] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentAction, setCommentAction] = useState(''); // 'approve' or 'reject'
  const [commentText, setCommentText] = useState('');
  const [selectedRequestForComment, setSelectedRequestForComment] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      const priority = requests.filter(r => {
        const daysPending = Math.floor((new Date() - new Date(r.created_at)) / (1000 * 60 * 60 * 24));
        return daysPending > 3;
      });
      setPriorityRequests(priority);
    }
  }, [requests]);

  const fetchRequests = async () => {
    try {
      const response = await getDemandes();
      const pendingRequests = response.data.filter(r =>
        r.statut === 'en_attente' &&
        (r.typeDemande === 'conge' || r.typeDemande === 'absence' || r.typeDemande === 'maladie')
      );

      pendingRequests.sort((a, b) => {
        const aDays = Math.floor((new Date() - new Date(a.created_at)) / (1000 * 60 * 60 * 24));
        const bDays = Math.floor((new Date() - new Date(b.created_at)) / (1000 * 60 * 60 * 24));
        if (aDays > 3 && bDays <= 3) return -1;
        if (bDays > 3 && aDays <= 3) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setRequests(pendingRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des demandes',
        severity: 'error'
      });
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setLoadingEmployee(true);
      const response = await getEmploye(employeeId);
      setEmployeeDetails(response.data);
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setEmployeeDetails(null);
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleQuickApprove = (request) => {
    setSelectedRequestForComment(request);
    setCommentAction('approve');
    setCommentText('');
    setShowCommentDialog(true);
  };

  const handleQuickReject = (request) => {
    setSelectedRequestForComment(request);
    setCommentAction('reject');
    setCommentText('');
    setShowCommentDialog(true);
  };

  const handleCommentSubmit = async () => {
    try {
      if (commentAction === 'approve') {
        await approveDemande(selectedRequestForComment.id, commentText);
        setSnackbar({
          open: true,
          message: `Demande #${selectedRequestForComment.id} approuvée avec succès`,
          severity: 'success'
        });
      } else {
        await rejectDemande(selectedRequestForComment.id, commentText);
        setSnackbar({
          open: true,
          message: `Demande #${selectedRequestForComment.id} refusée`,
          severity: 'warning'
        });
      }
      setShowCommentDialog(false);
      setTimeout(() => fetchRequests(), 500);
    } catch (error) {
      console.error('Error processing request:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du traitement de la demande',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    await fetchEmployeeDetails(request.employe_id);
    setShowDetailsModal(true);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRequests.map((n) => n.id);
      setSelectedRows(newSelected);
      return;
    }
    setSelectedRows([]);
  };

  const handleSelectRow = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1),
      );
    }

    setSelectedRows(newSelected);
  };

  const filteredRequests = useMemo(() => {
    let result = requests;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(request => {
        const name = `${request.employe?.nom || ''} ${request.employe?.prenom || ''}`.toLowerCase();
        const email = (request.employe?.email || '').toLowerCase();
        const matricule = (request.employe?.im || '').toLowerCase();
        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          matricule.includes(searchLower) ||
          request.id.toString().includes(searchLower)
        );
      });
    }

    if (filterType !== 'all') {
      result = result.filter(request => request.typeDemande === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(request => request.statut === filterStatus);
    }

    return result;
  }, [requests, searchTerm, filterType, filterStatus]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at' || sortField === 'dateDebut' || sortField === 'dateFin') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRequests, sortField, sortDirection]);

  const paginatedRequests = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRequests.slice(start, start + rowsPerPage);
  }, [sortedRequests, page, rowsPerPage]);

  const stats = useMemo(() => ({
    total: requests.length,
    conge: requests.filter(r => r.typeDemande === 'conge').length,
    absence: requests.filter(r => r.typeDemande === 'absence').length,
    maladie: requests.filter(r => r.typeDemande === 'maladie').length,
    priority: priorityRequests.length,
    avgDays: requests.length > 0 ? Math.floor(
      requests.reduce((acc, r) => {
        const days = Math.floor((new Date() - new Date(r.created_at)) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / requests.length
    ) : 0
  }), [requests, priorityRequests]);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'conge': return 'Congé Annuel';
      case 'absence': return 'Absence';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'conge': '#1976d2',
      'absence': '#dc004e',
    };
    return colors[type] || '#757575';
  };

  const getPriorityLevel = (createdAt) => {
    const daysPending = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (daysPending > 5) return { level: 'Élevée', color: '#f44336' };
    if (daysPending > 3) return { level: 'Moyenne', color: '#ff9800' };
    return { level: 'Basse', color: '#4caf50' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderTable = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2,
        maxHeight: 'calc(100vh - 250px)',
        overflow: 'auto'
      }}
    >
      <Table stickyHeader size="medium">
        <TableHead>
          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableCell padding="checkbox" sx={{ width: 60 }}>
              <Checkbox
                indeterminate={selectedRows.length > 0 && selectedRows.length < filteredRequests.length}
                checked={filteredRequests.length > 0 && selectedRows.length === filteredRequests.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 100 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography>ID</Typography>
                <IconButton size="small" onClick={() => handleSort('id')}>
                  <Sort fontSize="small" />
                </IconButton>
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 200 }}>
              Employé
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 150 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography>Type</Typography>
                <IconButton size="small" onClick={() => handleSort('typeDemande')}>
                  <Sort fontSize="small" />
                </IconButton>
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 150 }}>
              Période
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 100 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography>Durée</Typography>
                <IconButton size="small" onClick={() => handleSort('nombreJours')}>
                  <Sort fontSize="small" />
                </IconButton>
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 150 }}>
              Priorité
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 150 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography>Date création</Typography>
                <IconButton size="small" onClick={() => handleSort('created_at')}>
                  <Sort fontSize="small" />
                </IconButton>
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 200 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRequests.map((request) => {
            const isSelected = selectedRows.indexOf(request.id) !== -1;
            const priority = getPriorityLevel(request.created_at);

            return (
              <TableRow 
                key={request.id} 
                hover 
                selected={isSelected}
                sx={{ 
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.light, 0.04) },
                  '&.Mui-selected': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelectRow(request.id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    #{request.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(getTypeColor(request.typeDemande), 0.1),
                        color: getTypeColor(request.typeDemande),
                        fontWeight: 600
                      }}
                    >
                      {request.employe?.prenom?.[0]}{request.employe?.nom?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {request.employe?.prenom} {request.employe?.nom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 12 }} />
                        {request.employe?.email || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.employe?.im || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(request.typeDemande)}
                    size="small"
                    sx={{
                      bgcolor: alpha(getTypeColor(request.typeDemande), 0.1),
                      color: getTypeColor(request.typeDemande),
                      fontWeight: 600,
                      border: `1px solid ${alpha(getTypeColor(request.typeDemande), 0.3)}`
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(request.dateDebut)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      au {formatDate(request.dateFin)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${request.nombreJours || 0} jour${(request.nombreJours || 0) !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.dark,
                      fontWeight: 700
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={priority.level}
                    size="small"
                    sx={{
                      bgcolor: alpha(priority.color, 0.1),
                      color: priority.color,
                      fontWeight: 600,
                      border: `1px solid ${alpha(priority.color, 0.3)}`
                    }}
                    icon={<PriorityHigh sx={{ fontSize: 14, color: priority.color }} />}
                  />
                </TableCell>
                <TableCell>
                  <Stack>
                    <Typography variant="body2">
                      {formatDate(request.created_at)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(request.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Voir détails">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(request)}
                        sx={{ 
                          borderRadius: 1,
                          textTransform: 'none',
                          minWidth: 'auto',
                          px: 1.5
                        }}
                      >
                        Détails
                      </Button>
                    </Tooltip>
                    <Tooltip title="Approuver">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: alpha('#4caf50', 0.1),
                          color: '#4caf50',
                          '&:hover': { bgcolor: alpha('#4caf50', 0.2) }
                        }}
                        onClick={() => handleQuickApprove(request)}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refuser">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: alpha('#f44336', 0.1),
                          color: '#f44336',
                          '&:hover': { bgcolor: alpha('#f44336', 0.2) }
                        }}
                        onClick={() => handleQuickReject(request)}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <PageWrapper>
      <Box sx={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: theme.palette.background.default
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Validation RH
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestion des demandes de congés et absences
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Badge badgeContent={stats.priority} color="error">
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={fetchRequests}
                  sx={{ borderRadius: 2 }}
                >
                  Actualiser
                </Button>
              </Badge>
            </Stack>
          </Stack>
        </Box>

        {/* Quick Stats & Filters */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Close />
                    </IconButton>
                  )
                }}
                size="small"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">Tous les types</MenuItem>
                    <MenuItem value="conge">Congé annuel</MenuItem>
                    <MenuItem value="absence">Absence</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                >
                  Filtres
                </Button>
                <ButtonGroup variant="outlined" size="small">
                  <Button onClick={() => handleSelectAll({ target: { checked: true } })}>
                    Tout sélectionner
                  </Button>
                  <Button onClick={() => setSelectedRows([])}>
                    Tout désélectionner
                  </Button>
                </ButtonGroup>
              </Stack>
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Assignment sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Demandes totales
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PriorityHigh sx={{ color: 'error.main' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="error">
                        {stats.priority}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Demandes prioritaires
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime sx={{ color: 'warning.main' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="warning.main">
                        {stats.avgDays}j
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Attente moyenne
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DateRange sx={{ color: 'success.main' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {stats.conge}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Congés annuels
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content Area - Full Screen Table */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden',
          p: 2
        }}>
          {priorityRequests.length > 0 && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.warning.light}`
              }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => priorityRequests.length > 0 && handleViewDetails(priorityRequests[0])}
                >
                  Traiter maintenant
                </Button>
              }
            >
              <Typography variant="body2" fontWeight={600}>
                 {priorityRequests.length} demande(s) prioritaire(s) nécessite(nt) une attention immédiate
              </Typography>
            </Alert>
          )}

          {filteredRequests.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 'calc(100vh - 300px)',
              textAlign: 'center'
            }}>
              <TaskAlt sx={{ fontSize: 80, color: alpha('#4caf50', 0.3), mb: 3 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Aucune demande en attente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toutes les demandes ont été traitées
              </Typography>
            </Box>
          ) : (
            <>
              {renderTable()}
              
              {/* Pagination and Selection Info */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedRows.length > 0 && `${selectedRows.length} sélectionné(s) • `}
                  Affichage {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredRequests.length)} 
                  sur {filteredRequests.length} demandes
                </Typography>
                
                <TablePagination
                  component="div"
                  count={filteredRequests.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
              </Stack>
            </>
          )}
        </Box>

        {/* Details Modal */}
        <Dialog
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={800}>
                📋 Détails de la demande
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Fermer">
                  <IconButton onClick={() => setShowDetailsModal(false)}>
                    <Close />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </DialogTitle>
          
          <DialogContent dividers>
            {selectedRequest && employeeDetails ? (
              <Grid container spacing={3}>
                {/* Left Column: Employee Info */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              mx: 'auto',
                              mb: 2,
                              bgcolor: alpha(getTypeColor(selectedRequest.typeDemande), 0.2),
                              color: getTypeColor(selectedRequest.typeDemande),
                              fontSize: '2rem'
                            }}
                          >
                            {employeeDetails.prenom?.[0]}{employeeDetails.nom?.[0]}
                          </Avatar>
                          
                          <Typography variant="h6" fontWeight={700}>
                            {employeeDetails.prenom} {employeeDetails.nom}
                          </Typography>
                          <Chip
                            label={employeeDetails.poste}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>

                        <Divider />

                        <Stack spacing={1.5}>
                          {[
                            { icon: <Email />, label: 'Email', value: employeeDetails.email },
                            { icon: <Phone />, label: 'Téléphone', value: employeeDetails.telephone },
                            { icon: <Work />, label: 'Service', value: employeeDetails.service },
                            { icon: <LocationOn />, label: 'Corps', value: employeeDetails.corps },
                            { icon: <VerifiedUser />, label: 'Grade', value: employeeDetails.grade },
                            { icon: <CalendarToday />, label: 'Ancienneté', value: employeeDetails.date_prise_service ? 
                              `${Math.floor((new Date() - new Date(employeeDetails.date_prise_service)) / (1000 * 60 * 60 * 24 * 365))} ans` : 'N/A' }
                          ].map((item, index) => (
                            <Box key={index}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.icon}
                                {item.label}
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {item.value || 'Non spécifié'}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right Column: Request Details */}
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    {/* Request Header */}
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Chip
                              label={getTypeLabel(selectedRequest.typeDemande)}
                              sx={{
                                bgcolor: alpha(getTypeColor(selectedRequest.typeDemande), 0.1),
                                color: getTypeColor(selectedRequest.typeDemande),
                                fontWeight: 700,
                                fontSize: '1rem'
                              }}
                            />
                            <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                              Demande #{selectedRequest.id}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${selectedRequest.nombreJours || 0} jours`}
                            color="primary"
                            sx={{ fontWeight: 700, fontSize: '1rem' }}
                          />
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Period Card */}
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Période
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: alpha('#1976d2', 0.05),
                              borderRadius: 2,
                              textAlign: 'center'
                            }}>
                              <Typography variant="caption" color="text.secondary">
                                Date de début
                              </Typography>
                              <Typography variant="h5" fontWeight={800} color="primary">
                                {formatDate(selectedRequest.dateDebut)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: alpha('#1976d2', 0.05),
                              borderRadius: 2,
                              textAlign: 'center'
                            }}>
                              <Typography variant="caption" color="text.secondary">
                                Date de fin
                              </Typography>
                              <Typography variant="h5" fontWeight={800} color="primary">
                                {formatDate(selectedRequest.dateFin)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Comments Card */}
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Commentaire
                        </Typography>
                        <Box sx={{ 
                          p: 3, 
                          bgcolor: alpha('#f5f5f5', 0.5),
                          borderRadius: 2,
                          minHeight: 100
                        }}>
                          <Typography variant="body1">
                            {selectedRequest.commentaire || 'Aucun commentaire fourni'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Attachments */}
                    {selectedRequest.justification && (
                      <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            Pièce jointe
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AttachFile />}
                            onClick={() => window.open(selectedRequest.justification, '_blank')}
                            sx={{ borderRadius: 2 }}
                          >
                            Ouvrir le document
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LinearProgress sx={{ width: '100%', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Chargement des détails...
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="outlined"
                startIcon={<ArrowBack />}
                sx={{ flex: 1, borderRadius: 2 }}
              >
                Retour
              </Button>
              <Button
                onClick={() => handleQuickReject(selectedRequest)}
                variant="contained"
                color="error"
                startIcon={<ThumbDown />}
                sx={{ flex: 1, borderRadius: 2 }}
              >
                Refuser
              </Button>
              <Button
                onClick={() => handleQuickApprove(selectedRequest)}
                variant="contained"
                color="success"
                startIcon={<ThumbUp />}
                sx={{ flex: 1, borderRadius: 2 }}
              >
                Approuver
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog
          open={showCommentDialog}
          onClose={() => setShowCommentDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Comment sx={{ color: commentAction === 'approve' ? 'success.main' : 'error.main' }} />
              <Typography variant="h6" fontWeight={700}>
                {commentAction === 'approve' ? 'Approuver' : 'Refuser'} la demande #{selectedRequestForComment?.id}
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {commentAction === 'approve'
                ? 'Veuillez ajouter un commentaire pour l\'approbation (optionnel) :'
                : 'Veuillez ajouter un commentaire pour le refus (requis) :'
              }
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={commentAction === 'approve' ? 'Commentaire d\'approbation...' : 'Raison du refus...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mt: 2 }}
              required={commentAction === 'reject'}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              onClick={() => setShowCommentDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCommentSubmit}
              variant="contained"
              color={commentAction === 'approve' ? 'success' : 'error'}
              disabled={commentAction === 'reject' && !commentText.trim()}
              sx={{ borderRadius: 2 }}
            >
              {commentAction === 'approve' ? 'Approuver' : 'Refuser'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              borderRadius: 2,
              boxShadow: 6
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageWrapper>
  );
};

export default Validation;