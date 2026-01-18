import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  useTheme,
  alpha,
  LinearProgress,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Badge,
  TablePagination
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  BusinessCenter as BusinessIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Work as WorkIcon,
  EventNote as EventNoteIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getDemandes, getEmployes, getEmployeStatistics } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';
import LeaveForm from '../../components/forms/LeaveForm';

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [demandes, setDemandes] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [openLeaveForm, setOpenLeaveForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const COLORS = {
    approved: '#4caf50',
    pending: '#ff9800',
    rejected: '#f44336',
    cancelled: '#9e9e9e'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [demandesRes, employesRes, statsRes] = await Promise.all([
        getDemandes(),
        getEmployes(),
        getEmployeStatistics(),
      ]);

      console.log('API Response - Employes:', employesRes.data);
      console.log('API Response - Stats:', statsRes.data);

      const demandesData = demandesRes.data;
      setDemandes(demandesData);

      // Use dynamic stats from backend
      const statsData = statsRes.data;

      setStats({
        totalEmployees: employesRes.data.active_employees || 0,
        totalAllEmployees: employesRes.data.total_employees || 0,
        pendingRequests: demandesData.filter(d => d.statut === 'en_attente').length,
        approvedRequests: demandesData.filter(d => d.statut === 'approuvee').length,
        rejectedRequests: demandesData.filter(d => d.statut === 'refusee').length,
        // Add dynamic statistics from backend
        totalEmployes: statsData.total_employes || 0,
        employesParSexe: statsData.employes_par_sexe || {},
        employesParCorps: statsData.employes_par_corps || {},
        employesParRole: statsData.employes_par_role || {},
        employesParTypesPersonnel: statsData.employes_par_types_personnel || {},
        nouveauxEmployesCeMois: statsData.nouveaux_employes_ce_mois || 0,
      });

      // Prepare monthly chart data (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const monthlyStats = {};
      demandesData.forEach(demande => {
        const demandeDate = new Date(demande.dateCreation);
        if (demandeDate >= twelveMonthsAgo) {
          const month = demandeDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          monthlyStats[month] = (monthlyStats[month] || 0) + 1;
        }
      });

      // Create data for last 12 months, filling missing months with 0
      const monthlyChartData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        monthlyChartData.push({
          month: monthKey,
          demandes: monthlyStats[monthKey] || 0
        });
      }
      setMonthlyData(monthlyChartData);

      // Prepare status pie chart data
      const statusStats = demandesData.reduce((acc, demande) => {
        acc[demande.statut] = (acc[demande.statut] || 0) + 1;
        return acc;
      }, {});
      const statusChartData = Object.entries(statusStats).map(([status, count]) => ({
        name: status === 'en_attente' ? 'En attente' :
              status === 'approuvee' ? 'Approuvée' :
              status === 'refusee' ? 'Refusée' : 'Annulée',
        value: count,
        color: status === 'en_attente' ? COLORS.pending :
               status === 'approuvee' ? COLORS.approved :
               status === 'refusee' ? COLORS.rejected : COLORS.cancelled
      }));
      setStatusData(statusChartData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeaveFormSuccess = () => {
    setOpenLeaveForm(false);
    // Refresh data
    window.location.reload();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approuvee': return 'success';
      case 'refusee': return 'error';
      case 'en_attente': return 'warning';
      case 'annulee': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approuvee': return 'Approuvée';
      case 'refusee': return 'Refusée';
      case 'en_attente': return 'En attente';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  const validatedLeaves = demandes.filter(d => (d.statut === 'approuvee' || d.statut === 'refusee') && (d.typeDemande === 'conge' || d.typeDemande === 'absence'));

  // Calculate additional metrics for the new cards
  const totalRequests = demandes.length;
  const avgRequestsPerEmployee = stats.totalEmployees > 0 ? (totalRequests / stats.totalEmployees).toFixed(1) : 0;
  const approvalRate = totalRequests > 0 ? Math.round((stats.approvedRequests / totalRequests) * 100) : 0;
  const pendingRate = totalRequests > 0 ? Math.round((stats.pendingRequests / totalRequests) * 100) : 0;
  const rejectionRate = totalRequests > 0 ? Math.round((stats.rejectedRequests / totalRequests) * 100) : 0;

  if (loading) {
    return (
      <PageWrapper>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Container>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth={false}>
        {/* Modern Header */}
        <Box sx={{
          mb: 4,
          p: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Tableau de Bord RH
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 400, mb: 2 }}>
                Gestion professionnelle des congés et absences
              </Typography>

              {/* Quick Stats Row */}
              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 32, height: 32 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {stats.totalEmployees}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Employés
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), width: 32, height: 32 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                      {stats.pendingRequests}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En attente
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), width: 32, height: 32 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      {stats.approvedRequests}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Approuvées
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>


          </Box>
        </Box>

        {/* Modern Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Row 1: Overview Cards */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                }
              }}
            >
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(40px, -40px)'
              }} />

              <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                    <PeopleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Effectif Total
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Employés actifs dans l'entreprise
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: '3rem' }}>
                  {stats.totalAllEmployees}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Taux d'activité
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.totalAllEmployees > 0 ? Math.round((stats.totalEmployees / stats.totalAllEmployees) * 100) + '%' : '0%'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalAllEmployees > 0 ? (stats.totalEmployees / stats.totalAllEmployees) * 100 : 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ mt: 'auto', display: 'block', opacity: 0.8 }}>
                  {stats.totalAllEmployees > 0
                    ? `Moyenne: ${avgRequestsPerEmployee} demande${avgRequestsPerEmployee > 1 ? 's' : ''} par employé`
                    : 'Aucun employé enregistré'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(240, 147, 251, 0.3)',
                }
              }}
            >
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(40px, -40px)'
              }} />

              <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                    <AssessmentIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Gestion des Demandes
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Suivi des congés et absences
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: '3rem' }}>
                  {totalRequests}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Taux d'approbation
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {approvalRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={approvalRate}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ mt: 'auto', display: 'block', opacity: 0.8 }}>
                  {stats.pendingRequests > 0
                    ? `${stats.pendingRequests} demande${stats.pendingRequests > 1 ? 's' : ''} en attente de validation`
                    : 'Toutes les demandes traitées'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Row 2: Detailed Stats Cards */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(76, 175, 80, 0.3)',
                }
              }}
            >
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(40px, -40px)'
              }} />

              <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Demandes Approuvées
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Congés et absences validés
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: '3rem' }}>
                  {stats.approvedRequests}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Taux d'approbation
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {approvalRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={approvalRate}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ mt: 'auto', display: 'block', opacity: 0.8 }}>
                  {stats.totalEmployees > 0
                    ? `${(stats.approvedRequests / stats.totalEmployees).toFixed(1)} par employé en moyenne`
                    : 'Aucune donnée disponible'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(255, 152, 0, 0.3)',
                }
              }}
            >
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(40px, -40px)'
              }} />

              <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                    <ScheduleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Demandes en Attente
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      En cours de validation
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: '3rem' }}>
                  {stats.pendingRequests}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Taux d'attente
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {pendingRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pendingRate}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ mt: 'auto', display: 'block', opacity: 0.8 }}>
                  {stats.pendingRequests > 0
                    ? `${stats.pendingRequests} demande${stats.pendingRequests > 1 ? 's' : ''} à traiter`
                    : 'Toutes les demandes traitées'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>



        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Monthly Requests Chart */}
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Évolution des demandes par mois
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis
                    dataKey="month"
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="demandes"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                    name="Demandes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Status Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card elevation={6} sx={{ borderRadius: 3, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BusinessIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Répartition par statut
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Approved Leaves Table */}
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalendarIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Congés et Absences Validés
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employé</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Durée</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date de validation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validatedLeaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((demande) => (
                    <TableRow
                      key={demande.id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.02)
                        }
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {demande.employe?.nom} {demande.employe?.prenom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {demande.employe?.poste}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={demande.typeDemande === 'conge' ? 'Congé annuel' : 'Absence'}
                          size="small"
                          color={demande.typeDemande === 'conge' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(demande.dateDebut).toLocaleDateString('fr-FR')} - {new Date(demande.dateFin).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {demande.nombreJours || 0} jour{demande.nombreJours > 1 ? 's' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(demande.statut)}
                          size="small"
                          color={getStatusColor(demande.statut)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(demande.updated_at || demande.dateCreation).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {validatedLeaves.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucun historique trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={validatedLeaves.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpenLeaveForm(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>

        {/* Leave Form Modal */}
        <Dialog
          open={openLeaveForm}
          onClose={() => setOpenLeaveForm(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Nouvelle Demande de Congé/Absence
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <LeaveForm onSuccess={handleLeaveFormSuccess} onClose={() => setOpenLeaveForm(false)} />
          </DialogContent>
        </Dialog>
      </Container>
    </PageWrapper>
  );
};

export default Dashboard;