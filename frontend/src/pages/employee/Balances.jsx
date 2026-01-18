import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Grid, Button, Box,
  Avatar, Chip, List, ListItem, ListItemText, ListItemIcon,
  Divider, LinearProgress, IconButton,
  Tabs, Tab, CircularProgress, Alert, Badge, Stack, alpha, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import {
  Work, BeachAccess, EventNote, TrendingUp, CalendarToday,
  CheckCircle, Pending, Cancel, Schedule,
  Info, History, AddCircle, ArrowForward,
  Notifications, Download, FilterList, MoreVert,
  AccessTime, EventAvailable, MedicalServices, FamilyRestroom
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getSoldeConges, getDemandes } from '../../api';
import axios from 'axios';
import PageWrapper from '../../components/layout/PageWrapper';
import LeaveForm from '../../components/forms/LeaveForm';

const Balances = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState({
    annual_leave: 30,
    absence_leave: 15,
    maladie: 10,
    maternite: 90
  });
  const [requests, setRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    approved_requests_this_year: 0,
    pending_requests: 0,
    active_requests: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState('conge');

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch balances
      const balanceResponse = await getSoldeConges();
      const employeeId = user?.employe?.id || user?.employee?.id;
      const userBalance = balanceResponse.data?.find(b => b.employe_id === employeeId);

      if (userBalance) {
        setBalances({
          annual_leave: userBalance.annual_leave ?? 30,
          absence_leave: userBalance.absence_leave ?? 15,
          maladie: userBalance.maladie ?? 10,
          maternite: userBalance.maternite ?? 90
        });
      }

      // Fetch requests
      const requestsResponse = await getDemandes();
      setRequests(requestsResponse.data || []);

      // Calculate dashboard stats
      const pendingRequests = requestsResponse.data?.filter(r => r.statut === 'en_attente') || [];
      const approvedRequests = requestsResponse.data?.filter(r => r.statut === 'approuvee') || [];
      const activeRequests = requestsResponse.data?.filter(r => r.statut === 'en_attente' || r.statut === 'approuvee') || [];

      setDashboardStats({
        approved_requests_this_year: approvedRequests.length,
        pending_requests: pendingRequests.length,
        active_requests: activeRequests.length
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);



  const getStatusIcon = (status) => {
    switch (status) {
      case 'approuvee':
        return <CheckCircle color="success" />;
      case 'en_attente':
        return <Pending color="warning" />;
      case 'refusee':
      case 'annulee':
        return <Cancel color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approuvee':
        return 'success';
      case 'en_attente':
        return 'warning';
      case 'refusee':
      case 'annulee':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'conge':
        return 'Congé Annuel';
      case 'absence':
        return 'Absence';
      case 'maladie':
        return 'Maladie';
      case 'maternite':
        return 'Maternité';
      default:
        return type;
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'conge':
        return <BeachAccess />;
      case 'absence':
        return <Work />;
      case 'maladie':
        return <MedicalServices />;
      case 'maternite':
        return <FamilyRestroom />;
      default:
        return <EventNote />;
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === 0) return requests.slice(0, 5);
    if (activeTab === 1) return requests.filter(r => r.statut === 'en_attente');
    if (activeTab === 2) return requests.filter(r => r.statut === 'approuvee');
    if (activeTab === 3) return requests.filter(r => r.statut === 'refusee' || r.statut === 'annulee');
    return requests;
  };

  const StatCard = ({ title, value, icon: Icon, gradient, used, total, type = 'conge', description, onClick }) => (
    <Card
      sx={{
        background: gradient,
        color: 'white',
        borderRadius: 3,
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'translateY(-8px)' : 'none',
          boxShadow: onClick ? `0 20px 40px ${alpha('#000', 0.2)}` : 'none'
        }
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }}
      />
      <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: alpha('#fff', 0.2),
                width: 56,
                height: 56,
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                {description}
              </Typography>
            </Box>
          </Box>
          <Badge
            badgeContent={total - used}
            color="secondary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                fontWeight: 'bold',
                minWidth: 24,
                height: 24,
                borderRadius: 12
              }
            }}
          />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h1" fontWeight="bold" sx={{ 
            fontSize: '4rem', 
            mb: 1,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            lineHeight: 1
          }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            jours restants
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Utilisation: {used} / {total} jours
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {Math.round((used / total) * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(used / total) * 100}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: alpha('#fff', 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                  borderRadius: 5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }
              }}
            />
          </Box>

          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }
            }}
            onClick={onClick}
          >
            Créer demande
          </Button>
        </Box>


      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid',
        borderColor: alpha(color, 0.2),
        backgroundColor: alpha(color, 0.05),
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: color,
          backgroundColor: alpha(color, 0.1),
          boxShadow: `0 8px 24px ${alpha(color, 0.2)}`
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 64,
            height: 64,
            mb: 2,
            '& .MuiSvgIcon-root': {
              fontSize: 32
            }
          }}
        >
          <Icon />
        </Avatar>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const SummaryCard = ({ title, icon: Icon, color, stats }) => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            <Icon />
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                px: 1,
                borderRadius: 1,
                backgroundColor: index % 2 === 0 ? 'action.hover' : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {stat.chip && (
                  <Chip
                    label={stat.value}
                    color={stat.color}
                    size="small"
                    variant={stat.variant || 'filled'}
                    sx={{ fontWeight: 600 }}
                  />
                )}
                {!stat.chip && (
                  <Typography variant="body1" fontWeight={600}>
                    {stat.value}
                  </Typography>
                )}
                {stat.icon && <stat.icon sx={{ fontSize: 16, color: 'text.secondary' }} />}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const RequestItem = ({ request }) => {
    const statusColor = getStatusColor(request.statut);

    const getStatusColorHex = (color) => {
      switch (color) {
        case 'success': return '#4caf50';
        case 'warning': return '#ff9800';
        case 'error': return '#f44336';
        case 'default': return '#1976d2';
        default: return '#1976d2';
      }
    };

    return (
      <ListItem
        sx={{
          px: 3,
          py: 2.5,
          borderRadius: 2,
          mb: 1,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: alpha('#000', 0.1),
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: statusColor,
            transform: 'translateX(4px)',
            boxShadow: `0 4px 12px ${alpha(getStatusColorHex(statusColor), 0.1)}`
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 48 }}>
          <Avatar
            sx={{
              bgcolor: alpha(getStatusColorHex(statusColor), 0.1),
              color: getStatusColorHex(statusColor),
              width: 40,
              height: 40
            }}
          >
            {getStatusIcon(request.statut)}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getRequestTypeIcon(request.typeDemande)}
                <Typography variant="subtitle1" fontWeight={600}>
                  {getRequestTypeLabel(request.typeDemande)}
                </Typography>
              </Box>
              <Chip
                label={request.statut?.replace('_', ' ').toUpperCase()}
                color={statusColor}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          }
          secondary={
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(request.dateDebut).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">→</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(request.dateFin).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {request.nombreJours || 0} jour(s)
                  </Typography>
                </Box>
              </Stack>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Créée le {new Date(request.dateCreation).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
              
              {request.commentaire && (
                <Alert 
                  severity="info" 
                  sx={{ mt: 1.5 }}
                  icon={<Info sx={{ fontSize: 16 }} />}
                >
                  <Typography variant="body2">
                    {request.commentaire}
                  </Typography>
                </Alert>
              )}
            </Box>
          }
          primaryTypographyProps={{ component: 'div' }}
          secondaryTypographyProps={{ component: 'div' }}
        />
        <IconButton edge="end" sx={{ ml: 2 }}>
          <MoreVert />
        </IconButton>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Chargement de vos données...
            </Typography>
          </Box>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Header with User Info */}
        <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              py: 4,
              px: 4
            }}
          >
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                  Gestion des Congés et Absences
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                  Bonjour, {user?.name || 'Utilisateur'} • Consultez vos soldes et gérez vos demandes
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - Balance Cards */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Annual Leave Card */}
              <Grid item xs={12} md={6}>
                <StatCard
                  title="Congés Annuels"
                  icon={BeachAccess}
                  value={balances.annual_leave}
                  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  used={30 - balances.annual_leave}
                  total={30}
                  type="conge"
                  description="Congés payés annuels"
                  onClick={() => {
                    setSelectedRequestType('conge');
                    setFormDialogOpen(true);
                  }}
                />
              </Grid>

              {/* Absence Card */}
              <Grid item xs={12} md={6}>
                <StatCard
                  title="Absences"
                  icon={Work}
                  value={balances.absence_leave}
                  gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  used={15 - balances.absence_leave}
                  total={15}
                  type="absence"
                  description="Absences autorisées"
                  onClick={() => {
                    setSelectedRequestType('absence');
                    setFormDialogOpen(true);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Quick Actions & Summary */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>


              {/* Summary */}
              <Grid item xs={12}>
                <SummaryCard
                  title="Résumé des demandes"
                  icon={Notifications}
                  color="#1976d2"
                  stats={[
                    { label: 'Total des demandes', value: requests.length, icon: EventAvailable },
                    { label: 'En attente', value: requests.filter(r => r.statut === 'en_attente').length, color: 'warning', chip: true },
                    { label: 'Approuvées', value: requests.filter(r => r.statut === 'approuvee').length, color: 'success', chip: true },
                    { label: 'Refusées', value: requests.filter(r => r.statut === 'refusee').length, color: 'error', chip: true }
                  ]}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Requests History Section */}
        <Box sx={{ mt: 6 }}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 4, pt: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                    <History sx={{ mr: 2, color: 'primary.main' }} />
                    Historique des Demandes
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      startIcon={<FilterList />}
                      variant="outlined"
                      size="small"
                    >
                      Filtrer
                    </Button>
                    <Button
                      startIcon={<Download />}
                      variant="outlined"
                      size="small"
                    >
                      Exporter
                    </Button>
                  </Box>
                </Box>

                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <Tab 
                    icon={<EventNote />} 
                    iconPosition="start" 
                    label={`Toutes (${requests.length})`} 
                  />
                  <Tab 
                    icon={<Pending />} 
                    iconPosition="start" 
                    label={
                      <Badge badgeContent={requests.filter(r => r.statut === 'en_attente').length} color="warning">
                        <span>En attente</span>
                      </Badge>
                    } 
                  />
                  <Tab 
                    icon={<CheckCircle />} 
                    iconPosition="start" 
                    label={
                      <Badge badgeContent={requests.filter(r => r.statut === 'approuvee').length} color="success">
                        <span>Approuvées</span>
                      </Badge>
                    } 
                  />
                  <Tab 
                    icon={<Cancel />} 
                    iconPosition="start" 
                    label={
                      <Badge badgeContent={requests.filter(r => r.statut === 'refusee' || r.statut === 'annulee').length} color="error">
                        <span>Refusées</span>
                      </Badge>
                    } 
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {getFilteredRequests().length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <EventNote sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.3 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      Aucune demande trouvée
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      {activeTab === 0 
                        ? "Vous n'avez pas encore fait de demande de congé."
                        : activeTab === 1
                        ? "Vous n'avez aucune demande en attente."
                        : activeTab === 2
                        ? "Vous n'avez aucune demande approuvée."
                        : "Vous n'avez aucune demande refusée ou annulée."
                      }
                    </Typography>

                  </Box>
                ) : (
                  <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
                    {getFilteredRequests().map((request, index) => (
                      <React.Fragment key={request.id}>
                        <RequestItem request={request} />
                        {index < getFilteredRequests().length - 1 && (
                          <Divider sx={{ my: 1 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>

              {requests.length > 5 && activeTab === 0 && (
                <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    onClick={() => console.log('Navigate to full history')}
                  >
                    Voir toutes les demandes ({requests.length})
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Leave Request Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            border: 'none'
          }
        }}
      >
       
        <DialogContent>
          <LeaveForm
            requestType={selectedRequestType}
            onClose={() => setFormDialogOpen(false)}
            onSuccess={() => {
              setFormDialogOpen(false);
              // Refresh data
              fetchData();
            }}
          />
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
};

export default Balances;