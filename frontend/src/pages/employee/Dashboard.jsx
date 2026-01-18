import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button, CircularProgress, Alert, Box,
  LinearProgress, Paper, Divider, Dialog, DialogContent, DialogTitle, Stack,
  Avatar, Chip, IconButton, Badge, useTheme, alpha
} from '@mui/material';
import {
  BeachAccess, Work, EventNote, TrendingUp, CalendarToday,
  CheckCircle, Pending, Cancel, Schedule, Add, Refresh,
  AccountCircle, Today, DateRange, Assignment, BarChart,
  Notifications, Settings, Help
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getDemandes, getSoldeConges } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';
import LeaveForm from '../../components/forms/LeaveForm';

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState({ annual_leave: 0, absence_leave: 0 });
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestsRes, balancesRes] = await Promise.all([
        getDemandes(),
        getSoldeConges(),
      ]);

      // Filter requests for current user
      const userRequests = requestsRes.data.filter(r => r.employe_id === user.id || r.user_id === user.id);
      setRequests(userRequests);

      // Find user's leave balance
      const employeeId = user?.employee?.id;
      const userBalance = balancesRes.data.find(b => b.employe_id === employeeId);
      if (userBalance) {
        setBalances({
          annual_leave: userBalance.annual_leave,
          absence_leave: userBalance.absence_leave
        });
      } else {
        // If no balance found, set to 0
        setBalances({ annual_leave: 0, absence_leave: 0 });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLeaveSuccess = () => {
    setShowLeaveForm(false);
    // Refresh data automatically without page reload
    fetchData();
  };

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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Modern Header */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'E'}
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Bonjour, {user?.name || 'Employé'} 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bienvenue sur votre tableau de bord RH
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={requests.filter(r => r.status === 'pending').length} color="warning">
                <IconButton
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Notifications color="warning" />
                </IconButton>
              </Badge>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchData}
                disabled={loading}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Actualiser
              </Button>
            </Box>
          </Box>

          {/* Quick Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  }
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <BeachAccess sx={{ fontSize: 32 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                        Congés Annuels
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          mb: 0.5,
                          color: 'white',
                          fontSize: '2rem'
                        }}
                      >
                        {balances.annual_leave}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.75rem' }}>
                        jours restants
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(240, 147, 251, 0.3)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  }
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <Work sx={{ fontSize: 32 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                        Absences
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          mb: 0.5,
                          color: 'white',
                          fontSize: '2rem'
                        }}
                      >
                        {balances.absence_leave}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.75rem' }}>
                        jours restants
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(74, 222, 128, 0.3)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  }
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 32 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                        Demandes Approuvées
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          mb: 0.5,
                          color: 'white',
                          fontSize: '2rem'
                        }}
                      >
                        {requests.filter(r => r.status === 'approved').length}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.75rem' }}>
                        cette année
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(251, 191, 36, 0.3)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  }
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <Pending sx={{ fontSize: 32 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                        En Attente
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          mb: 0.5,
                          color: 'white',
                          fontSize: '2rem'
                        }}
                      >
                        {requests.filter(r => r.status === 'pending').length}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.75rem' }}>
                        demandes actives
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  Actions Rapides
                </Typography>

                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => setShowLeaveForm(true)}
                    disabled={balances.annual_leave <= 0 && balances.absence_leave <= 0}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Nouvelle Demande
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DateRange />}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    Voir Mes Demandes
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<BarChart />}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      '&:hover': {
                        borderColor: theme.palette.secondary.main,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.04)
                      }
                    }}
                  >
                    Statistiques
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Help />}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      '&:hover': {
                        borderColor: theme.palette.info.main,
                        backgroundColor: alpha(theme.palette.info.main, 0.04)
                      }
                    }}
                  >
                    Aide & Support
                  </Button>
                </Stack>

                {(balances.annual_leave <= 0 && balances.absence_leave <= 0) && (
                  <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                    Aucun solde disponible pour faire une nouvelle demande
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Requests */}
          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Mes Dernières Demandes
                  </Typography>
                  <Chip
                    label={`${requests.length} demande${requests.length !== 1 ? 's' : ''}`}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </Box>

                {requests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <EventNote sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucune demande trouvée
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Vous n'avez pas encore fait de demande de congé ou d'absence.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowLeaveForm(true)}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      Faire ma première demande
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {requests.slice(0, 5).map((request, index) => (
                      <Card
                        key={request.id || index}
                        elevation={0}
                        sx={{
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                                {request.type === 'annual' ? <BeachAccess /> : <Work />}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {request.type === 'annual' ? 'Congé Annuel' : 'Absence'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Du {new Date(request.start_date).toLocaleDateString('fr-FR')} au {new Date(request.end_date).toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={
                                request.status === 'approved' ? 'Approuvé' :
                                request.status === 'pending' ? 'En attente' :
                                request.status === 'rejected' ? 'Refusé' : request.status
                              }
                              color={
                                request.status === 'approved' ? 'success' :
                                request.status === 'pending' ? 'warning' :
                                request.status === 'rejected' ? 'error' : 'default'
                              }
                              size="small"
                              sx={{ borderRadius: 2, fontWeight: 'bold' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Form Modal */}
        <Dialog
          open={showLeaveForm}
          onClose={() => setShowLeaveForm(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              m: 2
            }
          }}
        >
          <DialogTitle sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '4px 4px 0 0'
          }}>
            Nouvelle Demande de Congé
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <LeaveForm onSuccess={handleLeaveSuccess} onClose={() => setShowLeaveForm(false)} />
          </DialogContent>
        </Dialog>
      </Container>
    </PageWrapper>
  );
};

export default Dashboard;
