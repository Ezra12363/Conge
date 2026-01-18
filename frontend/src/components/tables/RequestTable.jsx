import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  TablePagination,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  alpha,
  useTheme,
  LinearProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Search,
  MoreVert,
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Delete,
  Email,
  Download,
  FilterList,
  Refresh,
  AccessTime,
  Today,
  EventNote,
  Person,
  MoreHoriz,
  Clear,
  FileCopy,
  Share,
  Print,
  Archive
} from '@mui/icons-material';

const RequestTable = ({ 
  requests, 
  onEdit, 
  onCancel, 
  onValidate, 
  onDelete, 
  onApprove, 
  onReject, 
  onView,
  onExport,
  onBulkAction,
  onStatusChange
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bulkSelect, setBulkSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, request: null });

  // Color schemes for status
  const statusColors = {
    'en_attente': { bg: alpha(theme.palette.warning.light, 0.2), color: theme.palette.warning.dark, icon: <AccessTime /> },
    'approuvee': { bg: alpha(theme.palette.success.light, 0.2), color: theme.palette.success.dark, icon: <CheckCircle /> },
    'refusee': { bg: alpha(theme.palette.error.light, 0.2), color: theme.palette.error.dark, icon: <Cancel /> },
    'annulee': { bg: alpha(theme.palette.grey[300], 0.2), color: theme.palette.grey[700], icon: <Clear /> }
  };

  const statusLabels = {
    'en_attente': 'En attente',
    'approuvee': 'Approuvée',
    'refusee': 'Refusée',
    'annulee': 'Annulée'
  };

  const typeLabels = {
    'conge': 'Congé',
    'absence': 'Absence',
    'maladie': 'Maladie',
    'formation': 'Formation'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  // Handle action selection
  const handleAction = (action) => {
    if (!selectedRequest) return;

    switch (action) {
      case 'view':
        onView?.(selectedRequest);
        break;
      case 'edit':
        onEdit?.(selectedRequest);
        break;
      case 'approve':
        setConfirmDialog({ open: true, action: 'approve', request: selectedRequest });
        break;
      case 'reject':
        setConfirmDialog({ open: true, action: 'reject', request: selectedRequest });
        break;
      case 'cancel':
        setConfirmDialog({ open: true, action: 'cancel', request: selectedRequest });
        break;
      case 'delete':
        setConfirmDialog({ open: true, action: 'delete', request: selectedRequest });
        break;
      case 'duplicate':
        onExport?.([selectedRequest.id], 'duplicate');
        break;
      case 'print':
        window.print();
        break;
      case 'share':
        onExport?.([selectedRequest.id], 'share');
        break;
      case 'archive':
        onBulkAction?.('archive', [selectedRequest.id]);
        break;
    }
    handleMenuClose();
  };

  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map(r => r.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Apply filters
  const filteredRequests = useMemo(() => {
    let result = requests;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(request => {
        const name = `${request.employe?.nom || ''} ${request.employe?.prenom || ''}`.toLowerCase();
        const email = (request.employe?.email || '').toLowerCase();
        const matricule = (request.employe?.im || '').toLowerCase();
        const type = typeLabels[request.typeDemande]?.toLowerCase() || '';
        
        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          matricule.includes(searchLower) ||
          type.includes(searchLower) ||
          request.id.toString().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.statut === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(request => request.typeDemande === typeFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      result = result.filter(request => {
        const requestDate = new Date(request.dateDebut);
        return requestDate >= startDate && requestDate <= endDate;
      });
    }

    return result;
  }, [requests, searchTerm, statusFilter, typeFilter, dateRange]);

  // Paginate
  const paginatedRequests = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => ({
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.statut === 'en_attente').length,
    approved: filteredRequests.filter(r => r.statut === 'approuvee').length,
    rejected: filteredRequests.filter(r => r.statut === 'refusee').length,
    cancelled: filteredRequests.filter(r => r.statut === 'annulee').length
  }), [filteredRequests]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with search and filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Filtres avancés">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                Filtres
                {statusFilter !== 'all' || typeFilter !== 'all' || dateRange.start || dateRange.end ? (
                  <Badge badgeContent="!" color="error" sx={{ ml: 1 }} />
                ) : null}
              </Button>
            </Tooltip>

            {selectedIds.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircle />}
                onClick={() => onBulkAction?.('approve', selectedIds)}
              >
                Actions ({selectedIds.length})
              </Button>
            )}

            <Tooltip title="Actualiser">
              <IconButton onClick={() => window.location.reload()}>
                <Refresh />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => onExport?.(selectedIds.length > 0 ? selectedIds : filteredRequests.map(r => r.id))}
            >
              Exporter
            </Button>
          </Stack>
        </Stack>

        {/* Advanced filters */}
        {showFilters && (
          <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.light, 0.05), borderRadius: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="en_attente">En attente</MenuItem>
                <MenuItem value="approuvee">Approuvée</MenuItem>
                <MenuItem value="refusee">Refusée</MenuItem>
                <MenuItem value="annulee">Annulée</MenuItem>
              </TextField>

              <TextField
                select
                label="Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Tous les types</MenuItem>
                <MenuItem value="conge">Congé</MenuItem>
                <MenuItem value="absence">Absence</MenuItem>
                <MenuItem value="maladie">Maladie</MenuItem>
                <MenuItem value="formation">Formation</MenuItem>
              </TextField>

              <TextField
                label="Date début"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Date fin"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <Button
                variant="text"
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setDateRange({ start: '', end: '' });
                }}
                startIcon={<Clear />}
              >
                Réinitialiser
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Statistics bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={`Total: ${stats.total}`} 
          variant="outlined" 
          color="primary"
        />
        <Chip 
          label={`En attente: ${stats.pending}`} 
          variant="outlined" 
          sx={{ bgcolor: alpha(theme.palette.warning.light, 0.2), color: theme.palette.warning.dark }}
          icon={<AccessTime />}
        />
        <Chip 
          label={`Approuvées: ${stats.approved}`} 
          variant="outlined" 
          sx={{ bgcolor: alpha(theme.palette.success.light, 0.2), color: theme.palette.success.dark }}
          icon={<CheckCircle />}
        />
        <Chip 
          label={`Refusées: ${stats.rejected}`} 
          variant="outlined" 
          sx={{ bgcolor: alpha(theme.palette.error.light, 0.2), color: theme.palette.error.dark }}
          icon={<Cancel />}
        />
      </Stack>

      {/* Bulk selection toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={bulkSelect}
            onChange={(e) => {
              setBulkSelect(e.target.checked);
              if (!e.target.checked) setSelectedIds([]);
            }}
            size="small"
          />
        }
        label="Sélection multiple"
        sx={{ mb: 1 }}
      />

      {/* Main table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
            <TableRow>
              {bulkSelect && (
                <TableCell padding="checkbox" sx={{ width: 60 }}>
                  <Tooltip title={selectedIds.length === filteredRequests.length ? "Tout désélectionner" : "Tout sélectionner"}>
                    <Button size="small" onClick={toggleSelectAll}>
                      {selectedIds.length === filteredRequests.length ? '☑' : '☐'}
                    </Button>
                  </Tooltip>
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Employé</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Période</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Durée</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={bulkSelect ? 9 : 8} sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ opacity: 0.5 }}>
                    <Search sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucune demande trouvée
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? 'Essayez de modifier vos critères de recherche'
                        : 'Aucune demande disponible pour le moment'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => (
                <TableRow 
                  key={request.id} 
                  hover
                  sx={{ 
                    '&:hover': { bgcolor: alpha(theme.palette.primary.light, 0.04) },
                    ...(selectedIds.includes(request.id) && {
                      bgcolor: alpha(theme.palette.primary.light, 0.1)
                    })
                  }}
                >
                  {bulkSelect && (
                    <TableCell padding="checkbox">
                      <Button
                        size="small"
                        onClick={() => toggleSelectRow(request.id)}
                        sx={{ minWidth: 'auto' }}
                      >
                        {selectedIds.includes(request.id) ? '☑' : '☐'}
                      </Button>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      #{request.id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontSize: 14
                        }}
                      >
                        {request.employe?.prenom?.[0]}{request.employe?.nom?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {request.employe?.prenom} {request.employe?.nom}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email fontSize="inherit" />
                          {request.employe?.email || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Matricule: {request.employe?.im || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={typeLabels[request.typeDemande] || request.typeDemande}
                      size="small"
                      variant="outlined"
                      icon={<EventNote />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        <Today fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {formatDate(request.dateDebut)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        au {formatDate(request.dateFin)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={`${request.nombreJours || 0} jour${request.nombreJours > 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.dark,
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={statusColors[request.statut]?.icon}
                      label={statusLabels[request.statut] || request.statut}
                      size="small"
                      sx={{
                        bgcolor: statusColors[request.statut]?.bg,
                        color: statusColors[request.statut]?.color,
                        borderColor: statusColors[request.statut]?.color,
                        fontWeight: 600
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell align="center" sx={{ width: 160 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      {request.statut === 'en_attente' && (
                        <>
                          <Tooltip title="Approuver rapidement">
                            <IconButton
                              size="small"
                              onClick={() => onApprove?.(request)}
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.success.main, 0.2)
                                }
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Refuser rapidement">
                            <IconButton
                              size="small"
                              onClick={() => onReject?.(request)}
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.2)
                                }
                              }}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, request)}
                          sx={{
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            boxShadow: theme.shadows[3]
          }
        }}
      >
        <MenuItem onClick={() => handleAction('view')} sx={{ color: theme.palette.info.main }}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          Voir détails
        </MenuItem>

        {selectedRequest?.statut === 'en_attente' && [
          <MenuItem key="edit" onClick={() => handleAction('edit')} sx={{ color: theme.palette.primary.main }}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Modifier
          </MenuItem>,
          <MenuItem key="approve" onClick={() => handleAction('approve')} sx={{ color: theme.palette.success.main }}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Approuver
          </MenuItem>,
          <MenuItem key="reject" onClick={() => handleAction('reject')} sx={{ color: theme.palette.error.main }}>
            <Cancel sx={{ mr: 1 }} fontSize="small" />
            Refuser
          </MenuItem>,
          <MenuItem key="cancel" onClick={() => handleAction('cancel')} sx={{ color: theme.palette.grey[600] }}>
            <Clear sx={{ mr: 1 }} fontSize="small" />
            Annuler
          </MenuItem>
        ]}

        <Divider />

        <MenuItem onClick={() => handleAction('duplicate')}>
          <FileCopy sx={{ mr: 1 }} fontSize="small" />
          Dupliquer
        </MenuItem>

        <MenuItem onClick={() => handleAction('print')}>
          <Print sx={{ mr: 1 }} fontSize="small" />
          Imprimer
        </MenuItem>

        <MenuItem onClick={() => handleAction('share')}>
          <Share sx={{ mr: 1 }} fontSize="small" />
          Partager
        </MenuItem>

        <MenuItem onClick={() => handleAction('archive')} sx={{ color: theme.palette.grey[600] }}>
          <Archive sx={{ mr: 1 }} fontSize="small" />
          Archiver
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleAction('delete')} sx={{ color: theme.palette.error.main }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null, request: null })}>
        <DialogTitle>
          Confirmation requise
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'approve' && `Êtes-vous sûr de vouloir approuver la demande #${confirmDialog.request?.id} ?`}
            {confirmDialog.action === 'reject' && `Êtes-vous sûr de vouloir refuser la demande #${confirmDialog.request?.id} ?`}
            {confirmDialog.action === 'cancel' && `Êtes-vous sûr de vouloir annuler la demande #${confirmDialog.request?.id} ?`}
            {confirmDialog.action === 'delete' && `Êtes-vous sûr de vouloir supprimer définitivement la demande #${confirmDialog.request?.id} ?`}
          </Typography>
          {confirmDialog.action === 'delete' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Cette action est irréversible
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, request: null })}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color={
              confirmDialog.action === 'approve' ? 'success' :
              confirmDialog.action === 'reject' ? 'error' :
              confirmDialog.action === 'delete' ? 'error' : 'warning'
            }
            onClick={() => {
              if (confirmDialog.action === 'approve') onApprove?.(confirmDialog.request);
              if (confirmDialog.action === 'reject') onReject?.(confirmDialog.request.id);
              if (confirmDialog.action === 'cancel') onCancel?.(confirmDialog.request.id);
              if (confirmDialog.action === 'delete') onDelete?.(confirmDialog.request.id);
              setConfirmDialog({ open: false, action: null, request: null });
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestTable;