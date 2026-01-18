import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  alpha,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelledIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  ArrowForward,
  Download,
  FilterList,
  Refresh,
  TrendingUp,
  AccessTime,
  EmojiEvents,
  Person,
  CalendarMonth,
  WorkspacePremium,
  PictureAsPdf
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getDemandes, updateDemande, deleteDemande, getSoldeConge, updateSoldeConge } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import PageWrapper from '../../components/layout/PageWrapper';
import RequestTable from '../../components/tables/RequestTable';
import LeaveForm from '../../components/forms/LeaveForm';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (user?.employee?.id || user?.employe?.id) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getDemandes();
      // Filter requests by current user's employee ID
      const employeeId = user?.employee?.id || user?.employe?.id;
      const userRequests = response.data.filter(r => r.employe_id === employeeId);
      // Sort by creation date (newest first)
      userRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRequests(userRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      enqueueSnackbar('Erreur lors du chargement des demandes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request) => {
    if (request.statut !== 'en_attente') {
      enqueueSnackbar('Seules les demandes en attente peuvent être modifiées', { variant: 'warning' });
      return;
    }
    setSelectedRequest(request);
    setEditDialogOpen(true);
  };

  const handleCancel = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (request && request.statut !== 'en_attente') {
      enqueueSnackbar('Seules les demandes en attente peuvent être annulées', { variant: 'warning' });
      return;
    }
    setSelectedRequest(request);
    setCancelDialogOpen(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    setEditDialogOpen(false);
    setSelectedRequest(null);
    await fetchRequests();
    enqueueSnackbar('Demande modifiée avec succès', { variant: 'success' });
  };

  const handleCancelConfirm = async () => {
    if (!selectedRequest) return;

    try {
      await deleteDemande(selectedRequest.id);
      setCancelDialogOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
      enqueueSnackbar('Demande annulée avec succès', { variant: 'success' });
    } catch (err) {
      console.error('Error canceling request:', err);
      enqueueSnackbar('Erreur lors de l\'annulation de la demande', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return '#FFB74D'; // Orange
      case 'approuvee': return '#4CAF50'; // Green
      case 'refusee': return '#F44336'; // Red
      case 'annulee': return '#9E9E9E'; // Grey
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'approuvee': return 'Approuvée';
      case 'refusee': return 'Refusée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_attente': return <ScheduleIcon />;
      case 'approuvee': return <CheckCircleIcon />;
      case 'refusee': return <CancelledIcon />;
      case 'annulee': return <CancelledIcon />;
      default: return <InfoIcon />;
    }
  };

  const getTypeText = (typeDemande) => {
    switch (typeDemande) {
      case 'conge': return 'Congé Annuel';
      case 'absence': return 'Absence';
      default: return typeDemande;
    }
  };

  const getTypeColor = (typeDemande) => {
    switch (typeDemande) {
      case 'conge': return '#667eea';
      case 'absence': return '#f5576c';
      default: return '#757575';
    }
  };

  const getTypeIcon = (typeDemande) => {
    switch (typeDemande) {
      case 'conge': return <EmojiEvents />;
      case 'absence': return <AccessTime />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getFilteredRequests = () => {
    if (filterStatus === 'all') return requests;
    return requests.filter(r => r.statut === filterStatus);
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    en_attente: requests.filter(r => r.statut === 'en_attente').length,
    approuvee: requests.filter(r => r.statut === 'approuvee').length,
    refusee: requests.filter(r => r.statut === 'refusee').length,
    annulee: requests.filter(r => r.statut === 'annulee').length,
  };

  const getApprovalRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.approuvee / stats.total) * 100);
  };

  const exportToPDF = async () => {
    if (!selectedRequest) return;

    try {
      const pdf = new jsPDF();
      const content = document.getElementById('pdf-content');

      if (content) {
        const canvas = await html2canvas(content, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`demande-${selectedRequest.id}.pdf`);
        enqueueSnackbar('PDF exporté avec succès', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      enqueueSnackbar('Erreur lors de l\'export PDF', { variant: 'error' });
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description, trend }) => (
    <Card 
      sx={{ 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
          borderColor: color
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.2),
                color: color,
                width: 44,
                height: 44
              }}
            >
              <Icon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
            </Box>
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                bgcolor: trend.startsWith('+') ? alpha('#4CAF50', 0.2) : alpha('#F44336', 0.2),
                color: trend.startsWith('+') ? '#4CAF50' : '#F44336',
                fontWeight: 600
              }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const StatusFilter = ({ status, label, count, color, icon: Icon }) => (
    <Chip
      label={`${label} (${count})`}
      icon={<Icon sx={{ color: alpha(color, 0.8) }} />}
      onClick={() => setFilterStatus(status)}
      sx={{
        mr: 1,
        mb: 1,
        backgroundColor: filterStatus === status ? alpha(color, 0.2) : 'transparent',
        color: filterStatus === status ? color : 'text.primary',
        border: `1px solid ${alpha(color, filterStatus === status ? 0.5 : 0.3)}`,
        fontWeight: filterStatus === status ? 600 : 400,
        '&:hover': {
          backgroundColor: alpha(color, 0.1)
        }
      }}
    />
  );

  const RequestCard = ({ request }) => {
    const statusColor = getStatusColor(request.statut);
    const typeColor = getTypeColor(request.typeDemande);
    
    return (
      <Card
        sx={{
          borderRadius: 3,
          borderLeft: `4px solid ${statusColor}`,
          backgroundColor: 'background.paper',
          transition: 'all 0.3s ease',
          mb: 2,
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: `0 8px 24px ${alpha(statusColor, 0.15)}`
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(typeColor, 0.2),
                    color: typeColor,
                    width: 36,
                    height: 36
                  }}
                >
                  {getTypeIcon(request.typeDemande)}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {getTypeText(request.typeDemande)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                #{request.id} • Créé le {formatDate(request.created_at)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={getStatusIcon(request.statut)}
                label={getStatusText(request.statut)}
                size="small"
                sx={{
                  bgcolor: alpha(statusColor, 0.1),
                  color: statusColor,
                  fontWeight: 600,
                  border: `1px solid ${alpha(statusColor, 0.3)}`
                }}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Voir les détails">
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(request)}
                    sx={{
                      color: 'info.main',
                      '&:hover': { bgcolor: alpha('#0288d1', 0.1) }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                {request.statut === 'en_attente' && (
                  <Tooltip title="Annuler">
                    <IconButton
                      size="small"
                      onClick={() => handleCancel(request.id)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: alpha('#F44336', 0.1) }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Période:
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {formatDate(request.dateDebut)} → {formatDate(request.dateFin)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {request.nombreJours || 0} jour{request.nombreJours > 1 ? 's' : ''}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Détails:
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {request.commentaire || 'Aucun commentaire'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Chargement de vos demandes...
            </Typography>
          </Box>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Header */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 4, 
            p: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Mes Demandes
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Historique complet de vos demandes de congé et absence
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, backgroundColor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Filtres rapides
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Refresh />}
                  onClick={fetchRequests}
                  variant="outlined"
                  size="small"
                >
                  Actualiser
                </Button>
                <Button
                  startIcon={<FilterList />}
                  variant="outlined"
                  size="small"
                >
                  Filtres avancés
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Filtrer par statut:
              </Typography>
              <Box>
                <StatusFilter status="all" label="Toutes" count={stats.total} color="#2c3e50" icon={WorkspacePremium} />
                <StatusFilter status="en_attente" label="En attente" count={stats.en_attente} color="#FFB74D" icon={ScheduleIcon} />
                <StatusFilter status="approuvee" label="Approuvées" count={stats.approuvee} color="#4CAF50" icon={CheckCircleIcon} />
                <StatusFilter status="refusee" label="Refusées" count={stats.refusee} color="#F44336" icon={CancelledIcon} />
                <StatusFilter status="annulee" label="Annulées" count={stats.annulee} color="#9E9E9E" icon={CancelledIcon} />
              </Box>
            </Box>

            {/* Approval Progress */}
            {stats.total > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Taux d'approbation
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {getApprovalRate()}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getApprovalRate()}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha('#FFB74D', 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4CAF50',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Box>

        {/* Statistics Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total demandes"
              value={stats.total}
              icon={TrendingUp}
              color="#2c3e50"
              description="Toutes vos demandes"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="En attente"
              value={stats.en_attente}
              icon={ScheduleIcon}
              color="#FFB74D"
              description="En cours de traitement"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approuvées"
              value={stats.approuvee}
              icon={CheckCircleIcon}
              color="#4CAF50"
              description="Demandes validées"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Refusées"
              value={stats.refusee}
              icon={CancelledIcon}
              color="#F44336"
              description="Demandes rejetées"
            />
          </Grid>
        </Grid>

        {/* Requests List */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600}>
              Liste des demandes
              <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                ({getFilteredRequests().length} résultat{getFilteredRequests().length > 1 ? 's' : ''})
              </Typography>
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {getFilteredRequests().length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <HistoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.3 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Aucune demande trouvée
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {filterStatus === 'all'
                    ? "Vous n'avez pas encore fait de demande."
                    : `Vous n'avez aucune demande ${filterStatus === 'en_attente' ? 'en attente' : filterStatus === 'approuvee' ? 'approuvée' : filterStatus === 'refusee' ? 'refusée' : 'annulée'}.`
                  }
                </Typography>
                {filterStatus !== 'all' && (
                  <Button
                    variant="outlined"
                    onClick={() => setFilterStatus('all')}
                  >
                    Voir toutes les demandes
                  </Button>
                )}
              </Box>
            ) : (
              <Box>
                {getFilteredRequests().map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Modifier la demande
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <LeaveForm
                initialData={selectedRequest}
                onClose={() => setEditDialogOpen(false)}
                onSuccess={handleEditSuccess}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Confirmer l'annulation
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.
                </Alert>
                
                <Card sx={{ 
                  borderRadius: 2,
                  borderLeft: `4px solid ${getStatusColor(selectedRequest.statut)}`
                }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color={getTypeColor(selectedRequest.typeDemande)}>
                          {getTypeText(selectedRequest.typeDemande)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Statut actuel
                        </Typography>
                        <Chip
                          label={getStatusText(selectedRequest.statut)}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(selectedRequest.statut), 0.1),
                            color: getStatusColor(selectedRequest.statut),
                            fontWeight: 600
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date début
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(selectedRequest.dateDebut)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date fin
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(selectedRequest.dateFin)}
                        </Typography>
                      </Grid>
                      {selectedRequest.commentaire && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Commentaire
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{selectedRequest.commentaire}"
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>
              Conserver
            </Button>
            <Button 
              onClick={handleCancelConfirm} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Confirmer l'annulation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
            Décision relative à une demande de congé annuel ou absences
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box id="pdf-content" sx={{ pt: 2, px: 3 }}>
                {/* CCI Logo and Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box sx={{ mb: 2 }}>
                    <img
                      src="/logo-cci.png"
                      alt="CCI Logo"
                      style={{ height: '80px', width: 'auto' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                    CCI Fianarantsoa
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    Chambre de Commerce et d'Industrie de Fianarantsoa
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                  La demande de {getTypeText(selectedRequest.typeDemande).toLowerCase()} n°{selectedRequest.id} a été déposée par {user?.employee?.nom || user?.employe?.nom} {user?.employee?.prenom || user?.employe?.prenom}, employé(e) de l'institution.
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                  La demande a été créée le {formatDate(selectedRequest.created_at)} et mise à jour le {formatDate(selectedRequest.updated_at)}.
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                  La période de congé sollicitée s'étend du {formatDate(selectedRequest.dateDebut)} au {formatDate(selectedRequest.dateFin)}.
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Le nombre total de jours demandés est de {selectedRequest.nombreJours || 0} jour{(selectedRequest.nombreJours > 1 || selectedRequest.nombre_jours === 0) ? 's' : ''}.
                </Typography>

                {selectedRequest.commentaire && (
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Un commentaire a été renseigné dans la section des informations supplémentaires avec le contenu suivant : « {selectedRequest.commentaire} ».
                  </Typography>
                )}

                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                  Responsable de validation : {(selectedRequest.statut === 'approuvee' || selectedRequest.statut === 'refusee') && selectedRequest.valide_par_nom ? selectedRequest.valide_par_nom : '.....................................................'}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Statut de la demande : {getStatusIcon(selectedRequest.statut)} {getStatusText(selectedRequest.statut)}
                </Typography>

                {selectedRequest.statut === 'refusee' && selectedRequest.commentaire_refus && (
                  <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.6, fontStyle: 'italic', color: '#d32f2f' }}>
                    Motif du refus : "{selectedRequest.commentaire_refus}"
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              startIcon={<PictureAsPdf />}
              onClick={exportToPDF}
              variant="contained"
              color="primary"
            >
              Exporter en PDF
            </Button>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageWrapper>
  );
};

// Avatar component for statistics
const Avatar = ({ children, sx, ...props }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      ...sx
    }}
    {...props}
  >
    {children}
  </Box>
);

export default MyRequests;