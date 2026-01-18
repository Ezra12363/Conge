import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  useTheme,
  alpha,
  LinearProgress,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper as MuiPaper,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment,
  PendingActions,
  CheckCircle as CheckCircleIcon,
  Settings,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  BusinessCenter as BusinessIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Work as WorkIcon,
  EventNote as EventNoteIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Block as BlockIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  ScheduleSend as ScheduleSendIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  Business as BusinessIconAlt,
  Timeline as TimelineIconAlt,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import PageWrapper from '../../components/layout/PageWrapper';
import { getAdminDashboard } from '../../api';

const StatCard = ({ title, value, subtitle, icon, color, trend, trendValue, loading }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: color
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {loading ? (
              <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                {value?.toLocaleString('fr-FR')}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {trend === 'up' ? '+' : '-'}{Math.abs(trendValue)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  vs mois dernier
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEmployees: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    avgRequestsPerUser: 0,
    approvalRate: 0,
    pendingRate: 0,
    rejectionRate: 0,
    growthRate: 0
  });

  const [charts, setCharts] = useState({
    monthly: [],
    status: [],
    department: []
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: dayjs().startOf('year'),
    endDate: dayjs(),
    department: 'all'
  });

  const COLORS = {
    approved: '#10b981',
    pending: '#f59e0b',
    rejected: '#ef4444',
    cancelled: '#6b7280'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        start_date: filters.startDate.format('YYYY-MM-DD'),
        end_date: filters.endDate.format('YYYY-MM-DD')
      };

      const response = await getAdminDashboard(params);
      const data = response.data;

      setStats(data.stats);
      setCharts(data.charts);
      setRecentUsers(data.recentUsers);
      setRecentRequests(data.recentRequests);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTEE': return 'success';
      case 'REFUSEE': return 'error';
      case 'EN_ATTENTE': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACCEPTEE': return 'Approuvée';
      case 'REFUSEE': return 'Refusée';
      case 'EN_ATTENTE': return 'En attente';
      default: return status;
    }
  };

  if (loading && Object.values(stats).every(v => v === 0)) {
    return (
      <PageWrapper>
        <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Chargement du tableau de bord...
            </Typography>
          </Box>
        </Container>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchData}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth={false} sx={{ py: 4 }}>
        {/* Modern HR Dashboard Header */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="text.primary"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
                gutterBottom
              >
                Tableau de bord - Admin
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Système de Gestion des congés et absences
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={stats.pendingRequests} color="warning" sx={{ mr: 1 }}>
                <NotificationsIcon
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'warning.main' }
                  }}
                />
              </Badge>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
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



          {/* All Stats Cards in One Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderColor: theme.palette.primary.main,
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .stat-value': {
                      transform: 'scale(1.05)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      className="stat-icon"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      <PeopleIcon fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                        Utilisateurs Totaux
                      </Typography>
                      {loading ? (
                        <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                      ) : (
                        <Typography
                          className="stat-value"
                          variant="h4"
                          fontWeight="bold"
                          sx={{
                            mb: 0.5,
                            transition: 'all 0.3s ease',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {stats.totalUsers?.toLocaleString('fr-FR')}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Comptes actifs dans le système
                      </Typography>
                      {stats.growthRate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'success.main',
                              fontWeight: 600
                            }}
                          >
                            +{stats.growthRate}% ce mois
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>



            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.light, 0.08)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    borderColor: theme.palette.secondary.main,
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .stat-value': {
                      transform: 'scale(1.05)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      className="stat-icon"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: theme.palette.secondary.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
                      }}
                    >
                      <Assignment fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                        Demandes Totales
                      </Typography>
                      {loading ? (
                        <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                      ) : (
                        <Typography
                          className="stat-value"
                          variant="h4"
                          fontWeight="bold"
                          sx={{
                            mb: 0.5,
                            transition: 'all 0.3s ease',
                            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {stats.totalRequests?.toLocaleString('fr-FR')}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Toutes les demandes de congé
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.light, 0.08)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.warning.main, 0.3)}`,
                    borderColor: theme.palette.warning.main,
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .stat-value': {
                      transform: 'scale(1.05)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      className="stat-icon"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: theme.palette.warning.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.warning.main, 0.3)}`
                      }}
                    >
                      <PendingActions fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                        En Attente
                      </Typography>
                      {loading ? (
                        <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                      ) : (
                        <Typography
                          className="stat-value"
                          variant="h4"
                          fontWeight="bold"
                          sx={{
                            mb: 0.5,
                            transition: 'all 0.3s ease',
                            background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {stats.pendingRequests?.toLocaleString('fr-FR')}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Demandes en cours de traitement
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'warning.main',
                            fontWeight: 600
                          }}
                        >
                          {stats.pendingRate}% du total
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.light, 0.08)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.info.main, 0.3)}`,
                    borderColor: theme.palette.info.main,
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .stat-value': {
                      transform: 'scale(1.05)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      className="stat-icon"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: theme.palette.info.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.info.main, 0.3)}`
                      }}
                    >
                      <AssignmentTurnedInIcon fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                        Demandes Acceptées
                      </Typography>
                      {loading ? (
                        <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                      ) : (
                        <Typography
                          className="stat-value"
                          variant="h4"
                          fontWeight="bold"
                          sx={{
                            mb: 0.5,
                            transition: 'all 0.3s ease',
                            background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {stats.approvedRequests?.toLocaleString('fr-FR')}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Demandes approuvées avec succès
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'info.main',
                            fontWeight: 600
                          }}
                        >
                          {stats.approvalRate}% taux d'approbation
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 48,
                borderRadius: 2,
                mr: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <Tab label="Vue d'ensemble" />
            <Tab label="Analyse Détaillée" />
            <Tab label="Gestion Utilisateurs" />
            <Tab label="Historique Demandes" />
          </Tabs>
        </Box>

        {/* Tab Content */}

        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Charts Section */}
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BarChartIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Évolution des Demandes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Activité des 12 derniers mois
                      </Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={charts.monthly}>
                      <defs>
                        <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                      <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                      <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4]
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="demandes"
                        stroke={theme.palette.primary.main}
                        fillOpacity={1}
                        fill="url(#colorDemandes)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Distribution */}
            <Grid item xs={12} lg={4}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PieChartIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Répartition par Statut
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        État des demandes actuelles
                      </Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={charts.status}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4]
                        }}
                        formatter={(value, name) => [`${value} demandes`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} lg={6}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventNoteIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                      <Typography variant="h6" fontWeight="bold">
                        Demandes Récentes
                      </Typography>
                    </Box>
                    <Button size="small" endIcon={<ArrowForwardIcon />}>
                      Voir tout
                    </Button>
                  </Box>
                  <Stack spacing={2}>
                    {recentRequests.slice(0, 5).map((request) => (
                      <Box
                        key={request.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      >
                        <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                          {request.user_name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {request.user_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.type} • {request.nombre_jours} jours
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(request.statut)}
                          size="small"
                          color={getStatusColor(request.statut)}
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>


          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            {/* Department Analysis */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Analyse par Département
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Département</TableCell>
                          <TableCell align="right">Employés</TableCell>
                          <TableCell align="right">Demandes</TableCell>
                          <TableCell align="right">Taux</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {charts.department?.map((dept) => (
                          <TableRow key={dept.department}>
                            <TableCell>{dept.department}</TableCell>
                            <TableCell align="right">{dept.count}</TableCell>
                            <TableCell align="right">{dept.requests}</TableCell>
                            <TableCell align="right">
                              {dept.count > 0 ? Math.round((dept.requests / dept.count) * 100) / 100 : 0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Métriques de Performance
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Taux d'Approbation</Typography>
                        <Typography variant="body2" fontWeight="bold">{stats.approvalRate}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.approvalRate}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Taux de Rejet</Typography>
                        <Typography variant="body2" fontWeight="bold">{stats.rejectionRate}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.rejectionRate}
                        color="error"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Croissance</Typography>
                        <Typography variant="body2" fontWeight="bold" color={stats.growthRate >= 0 ? 'success.main' : 'error.main'}>
                          {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.abs(stats.growthRate), 100)}
                        color={stats.growthRate >= 0 ? 'success' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Utilisateurs Récents
                </Typography>
                <TextField
                  size="small"
                  placeholder="Rechercher..."
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell>Utilisateur</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rôle</TableCell>
                      <TableCell>Département</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date d'inscription</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.status === 'active' ? 'Actif' : 'Inactif'}
                            size="small"
                            color={user.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Demandes Récentes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell>Utilisateur</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Période</TableCell>
                      <TableCell>Jours</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date de création</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.user_name}</TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>
                          {request.date_debut} - {request.date_fin}
                        </TableCell>
                        <TableCell>{request.nombre_jours}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(request.statut)}
                            size="small"
                            color={getStatusColor(request.statut)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(request.date_creation).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: theme.shadows[8]
          }}
        >
          <AddIcon />
        </Fab>
      </Container>
    </PageWrapper>
  );
};

export default Dashboard;
