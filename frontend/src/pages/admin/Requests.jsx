import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  useTheme,
  Zoom,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Paper,
  alpha
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Person,
  Email,
  Work,
  CalendarToday,
  LocationOn,
  Description,
  AccessTime,
  VerifiedUser,
  ArrowBack,
  PictureAsPdf,
  Image,
  AttachFile,
  History,
  Group,
  Phone
} from '@mui/icons-material';
import { getDemandes, approveDemande, rejectDemande, updateDemande, deleteDemande, getEmploye, getValidations, createRapport } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';
import RequestTable from '../../components/tables/RequestTable';

const Requests = () => {
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    type: 'info'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [viewDialog, setViewDialog] = useState({
    open: false,
    request: null,
    employee: null,
    validations: [],
    loading: false
  });
  const [tabValue, setTabValue] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return 'warning';
      case 'approuvee': return 'success';
      case 'refusee': return 'error';
      case 'annulee': return 'default';
      default: return 'default';
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

  const getTypeText = (typeDemande) => {
    switch (typeDemande) {
      case 'conge': return 'Congé';
      case 'absence': return 'Absence';
      default: return typeDemande;
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

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getDemandes();
        setRequests(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      await approveDemande(request.id);
      // Refresh requests
      const response = await getDemandes();
      setRequests(response.data);
    } catch (err) {
      console.error('Error approving request:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDemande(id);
      // Refresh requests
      const response = await getDemandes();
      setRequests(response.data);
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleEdit = async (request) => {
    // For admin, edit might not be implemented yet
    console.log('Edit request:', request);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDemande(id);
      // Refresh requests
      const response = await getDemandes();
      setRequests(response.data);
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const handleConfirmAction = async () => {
    try {
      await confirmDialog.action();
      setConfirmDialog({ ...confirmDialog, open: false });
      setSnackbar({
        open: true,
        message: '✅ Action effectuée avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error performing action:', err);
      setConfirmDialog({ ...confirmDialog, open: false });
      setSnackbar({
        open: true,
        message: '❌ Erreur lors de l\'action',
        severity: 'error'
      });
    }
  };

  const handleApproveWithConfirm = (request) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmer l\'approbation',
      message: `Êtes-vous sûr de vouloir approuver la demande de ${request.employe?.nom} ${request.employe?.prenom} ?`,
      action: () => handleApprove(request),
      type: 'success'
    });
  };

  const handleRejectWithConfirm = (id) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmer le rejet',
      message: 'Êtes-vous sûr de vouloir rejeter cette demande ? Cette action est irréversible.',
      action: () => handleReject(id),
      type: 'error'
    });
  };

  const handleDeleteWithConfirm = (id) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement cette demande ? Cette action est irréversible.',
      action: () => handleDelete(id),
      type: 'error'
    });
  };

  const handleView = async (request) => {
    setViewDialog({ ...viewDialog, open: true, loading: true, request });

    try {
      // Fetch detailed employee information
      const employeeResponse = await getEmploye(request.employe_id);
      const employee = employeeResponse.data;

      // Fetch validation history for this request
      const validationsResponse = await getValidations();
      const validations = validationsResponse.data.filter(v => v.demande_id === request.id);

      setViewDialog({
        open: true,
        request,
        employee,
        validations,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching request details:', error);
      setViewDialog({
        open: true,
        request,
        employee: null,
        validations: [],
        loading: false
      });
    }
  };

  const handleExport = async (requestIds, action = 'export') => {
    try {
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      if (!userId) {
        setSnackbar({
          open: true,
          message: '❌ Utilisateur non authentifié',
          severity: 'error'
        });
        return;
      }

      // Generate report content based on selected requests
      let reportContent = '';
      let reportTitle = '';

      if (requestIds.length === 0) {
        // Export all requests
        reportTitle = 'Rapport de toutes les demandes';
        reportContent = `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}\n\n`;
        reportContent += `Nombre total de demandes: ${requests.length}\n\n`;

        // Group by status
        const statusStats = requests.reduce((acc, req) => {
          acc[req.statut] = (acc[req.statut] || 0) + 1;
          return acc;
        }, {});

        reportContent += 'Statistiques par statut:\n';
        Object.entries(statusStats).forEach(([status, count]) => {
          reportContent += `- ${getStatusText(status)}: ${count}\n`;
        });

        reportContent += '\nListe détaillée des demandes:\n';
        requests.forEach((req, index) => {
          reportContent += `\n${index + 1}. Demande #${req.id}\n`;
          reportContent += `   Employé: ${req.employe?.nom} ${req.employe?.prenom}\n`;
          reportContent += `   Type: ${getTypeText(req.typeDemande)}\n`;
          reportContent += `   Statut: ${getStatusText(req.statut)}\n`;
          reportContent += `   Période: ${formatDate(req.dateDebut)} - ${formatDate(req.dateFin)}\n`;
          reportContent += `   Nombre de jours: ${req.nombreJours}\n`;
        });
      } else {
        // Export selected requests
        const selectedRequests = requests.filter(req => requestIds.includes(req.id));
        reportTitle = `Rapport de ${selectedRequests.length} demande${selectedRequests.length > 1 ? 's' : ''} sélectionnée${selectedRequests.length > 1 ? 's' : ''}`;
        reportContent = `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}\n\n`;
        reportContent += `Nombre de demandes sélectionnées: ${selectedRequests.length}\n\n`;

        selectedRequests.forEach((req, index) => {
          reportContent += `\n${index + 1}. Demande #${req.id}\n`;
          reportContent += `   Employé: ${req.employe?.nom} ${req.employe?.prenom}\n`;
          reportContent += `   Type: ${getTypeText(req.typeDemande)}\n`;
          reportContent += `   Statut: ${getStatusText(req.statut)}\n`;
          reportContent += `   Période: ${formatDate(req.dateDebut)} - ${formatDate(req.dateFin)}\n`;
          reportContent += `   Nombre de jours: ${req.nombreJours}\n`;
          if (req.motif) {
            reportContent += `   Motif: ${req.motif}\n`;
          }
        });
      }

      // Create report in database
      const reportData = {
        titre: reportTitle,
        contenu: reportContent,
        type: 'demandes_export',
        date_generation: new Date().toISOString(),
        user_id: userId
      };

      await createRapport(reportData);

      setSnackbar({
        open: true,
        message: '✅ Rapport généré et sauvegardé avec succès',
        severity: 'success'
      });

      // Optionally trigger download
      if (action === 'download') {
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

    } catch (error) {
      console.error('Error creating report:', error);
      setSnackbar({
        open: true,
        message: '❌ Erreur lors de la génération du rapport',
        severity: 'error'
      });
    }
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom sx={{ px: 3 }}>
        Toutes les Demandes
      </Typography>
      <Box sx={{ px: 3 }}>
        <RequestTable
          requests={requests}
          onApprove={handleApproveWithConfirm}
          onReject={handleRejectWithConfirm}
          onEdit={handleEdit}
          onDelete={handleDeleteWithConfirm}
          onView={handleView}
          onExport={handleExport}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: confirmDialog.type === 'error' ? theme.palette.error.main :
                  confirmDialog.type === 'success' ? theme.palette.success.main :
                  theme.palette.warning.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmDialog.type === 'error' ? 'error' :
                   confirmDialog.type === 'success' ? 'success' : 'warning'}
            sx={{ borderRadius: 2 }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[6],
            alignItems: 'center'
          }}
          icon={snackbar.severity === 'success' ? <CheckCircle /> : <Cancel />}
        >
          <Typography fontWeight={600}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>

      {/* View Request Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ ...viewDialog, open: false })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[12],
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1
        }}>
          <Description />
          Détails de la Demande #{viewDialog.request?.id}
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {viewDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Chargement...</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(event, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Informations Générales" />
                <Tab label="Informations du Demandeur" />
                <Tab label="Informations Employé" />
                <Tab label="Historique de Validation" />
              </Tabs>

              {/* General Information Tab */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description />
                          Détails de la Demande
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">ID:</Typography>
                            <Typography variant="body2" fontWeight="medium">#{viewDialog.request?.id}</Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Type:</Typography>
                            <Chip
                              label={getTypeText(viewDialog.request?.typeDemande)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Statut:</Typography>
                            <Chip
                              label={getStatusText(viewDialog.request?.statut)}
                              color={getStatusColor(viewDialog.request?.statut)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Nombre de jours:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {viewDialog.request?.nombreJours} jour{viewDialog.request?.nombreJours > 1 ? 's' : ''}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Date de début:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDate(viewDialog.request?.dateDebut)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Date de fin:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDate(viewDialog.request?.dateFin)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Date de création:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDate(viewDialog.request?.created_at)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description />
                          Description et Commentaires
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ minHeight: 200 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Motif:
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 3 }}>
                            {viewDialog.request?.motif || 'Aucun motif spécifié'}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Commentaires:
                          </Typography>
                          <Typography variant="body1">
                            {viewDialog.request?.commentaire || 'Aucun commentaire'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Requester Information Tab */}
              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ textAlign: 'center', height: '100%' }}>
                      <CardContent>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mx: 'auto',
                            mb: 2,
                            bgcolor: theme.palette.secondary.main,
                            fontSize: '2rem'
                          }}
                        >
                          {viewDialog.request?.user?.nom?.charAt(0)}{viewDialog.request?.user?.prenom?.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">
                          {viewDialog.request?.user?.nom} {viewDialog.request?.user?.prenom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Demandeur
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person />
                          Informations du Demandeur
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Nom complet:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.request?.user?.nom} {viewDialog.request?.user?.prenom}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Email sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Email:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.request?.user?.email || 'Non spécifié'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Work sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Rôle:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.request?.user?.role || 'Non spécifié'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Date de création du compte:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {formatDate(viewDialog.request?.user?.created_at)}
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AccessTime sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Dernière connexion:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {formatDate(viewDialog.request?.user?.last_login) || 'Non disponible'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Employee Information Tab */}
              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ textAlign: 'center', height: '100%' }}>
                      <CardContent>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mx: 'auto',
                            mb: 2,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '2rem'
                          }}
                        >
                          {viewDialog.employee?.nom?.charAt(0)}{viewDialog.employee?.prenom?.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">
                          {viewDialog.employee?.nom} {viewDialog.employee?.prenom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {viewDialog.employee?.poste || 'Poste non spécifié'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person />
                          Informations Personnelles
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Nom complet:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.employee?.nom} {viewDialog.employee?.prenom}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Email sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Email:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.employee?.email || 'Non spécifié'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Phone sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Téléphone:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.employee?.telephone || 'Non spécifié'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Work sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Poste:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.employee?.poste || 'Non spécifié'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOn sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Département:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {viewDialog.employee?.departement || 'Non spécifié'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">Date d'embauche:</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 3 }}>
                              {formatDate(viewDialog.employee?.date_embauche)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Validation History Tab */}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History />
                    Historique de Validation
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {viewDialog.validations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Aucun historique de validation trouvé pour cette demande.
                    </Typography>
                  ) : (
                    <Stack spacing={3}>
                      {viewDialog.validations.map((validation, index) => (
                        <Card key={validation.id} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" fontWeight="medium">
                                Validation #{validation.id}
                              </Typography>
                              <Chip
                                label={validation.decision === 'approuvee' ? 'Approuvée' : 'Refusée'}
                                color={validation.decision === 'approuvee' ? 'success' : 'error'}
                                size="small"
                                variant="filled"
                              />
                            </Box>

                            <Grid container spacing={3}>
                              {/* Validator Information */}
                              <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', height: '100%', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                                  <CardContent>
                                    <Avatar
                                      sx={{
                                        width: 60,
                                        height: 60,
                                        mx: 'auto',
                                        mb: 1,
                                        bgcolor: theme.palette.info.main,
                                        fontSize: '1.5rem'
                                      }}
                                    >
                                      {validation.validateur?.nom?.charAt(0)}{validation.validateur?.prenom?.charAt(0)}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                      {validation.validateur?.nom} {validation.validateur?.prenom}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Validateur
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Validation Details */}
                              <Grid item xs={12} md={8}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <VerifiedUser />
                                      Détails de la Validation
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                                          <Typography variant="body2" color="text.secondary">Validateur:</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                          {validation.validateur?.nom} {validation.validateur?.prenom}
                                        </Typography>
                                      </Grid>

                                      <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                                          <Typography variant="body2" color="text.secondary">Date de validation:</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                          {formatDate(validation.created_at)}
                                        </Typography>
                                      </Grid>

                                      <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Email sx={{ color: 'text.secondary', fontSize: 18 }} />
                                          <Typography variant="body2" color="text.secondary">Email:</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                          {validation.validateur?.email || 'Non spécifié'}
                                        </Typography>
                                      </Grid>

                                      <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Work sx={{ color: 'text.secondary', fontSize: 18 }} />
                                          <Typography variant="body2" color="text.secondary">Rôle:</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                          {validation.validateur?.role || 'Non spécifié'}
                                        </Typography>
                                      </Grid>

                                      {validation.commentaire && (
                                        <Grid item xs={12}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Description sx={{ color: 'text.secondary', fontSize: 18 }} />
                                            <Typography variant="body2" color="text.secondary">Commentaire:</Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ ml: 3, p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                                            {validation.commentaire}
                                          </Typography>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setViewDialog({ ...viewDialog, open: false })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default Requests;
