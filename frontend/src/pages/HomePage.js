import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  Paper,
  IconButton,
  Stack,
  AppBar,
  Toolbar,
  Fab,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  AccountCircle as AccountIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessCenterIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Cloud as CloudIcon,
  Support as SupportIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  GroupWork as GroupWorkIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';


const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const companyInfo = {
    name: "CCI HAUTE MATSIATRA",
    fullName: "GESTION DES CONGES ANNUEL ET DES ABSENCES AU NIVEAU DE LA C.C.I HAUTE MATSIATRA",
    address: "Lot SIAA 40, Ex SOMACODIS Analakely",
    phone: "(+261) 34 05 526 25",
    email: "federationcci@gmail.com",
    hours: "Lundi au Vendredi de 8h 30 à 16h 30",
    ministries: [
      "Ministère de l'Industrie, du Commerce et de l'Artisanat",
      "Ministère de l'Economie et des Finances",
    ],
    partnerMinistry: "Ministère de l'Agriculture, de l'Elevage et de la Pêche",
  };

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'rh':
          navigate('/rh/dashboard', { replace: true });
          break;
        case 'employe':
          navigate('/employee/dashboard', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [user, loading, navigate]);

  const roles = [
    {
      id: 'admin',
      title: 'Administrateur',
      description: 'Gestion complète du système',
      icon: <AdminIcon sx={{ fontSize: 48 }} />,
      color: '#1a237e',
      gradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
      permissions: ['Gestion utilisateurs', 'Configuration système', 'Rapports globaux', 'Réinitialisation soldes'],
      features: ['Accès complet', 'Administration', 'Configuration avancée', 'Support technique'],
    },
    {
      id: 'rh',
      title: 'Responsable RH',
      description: 'Gestion des ressources humaines',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      permissions: ['Validation demandes', 'Consultation soldes', 'Historique global', 'Statistiques RH'],
      features: ['Validation demandes', 'Gestion employés', 'Rapports RH', 'Statistiques'],
    },
    {
      id: 'employe',
      title: 'Employé',
      description: 'Gestion personnelle des congés',
      icon: <AccountIcon sx={{ fontSize: 48 }} />,
      color: '#f57c00',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
      permissions: ['Demande congé', 'Consultation solde', 'Historique personnel', 'Suivi demandes'],
      features: ['Demande congé', 'Suivi demandes', 'Consultation solde', 'Historique personnel'],
    },
  ];

  const handleRoleSelect = (roleId) => {
    switch (roleId) {
      case 'admin':
        navigate('/admin/login');
        break;
      case 'rh':
        navigate('/rh/login');
        break;
      case 'employe':
        navigate('/employee/login');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Navigation Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="CCI Logo"
                sx={{ height: 40, width: 'auto' }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  fontSize: '1.1rem',
                }}
              >
                CCI HAUTE MATSIATRA
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button
                sx={{
                  color: '#666',
                  fontWeight: 500,
                  '&:hover': { color: '#1a237e' },
                }}
              >
                Fonctionnalités
              </Button>
              <Button
                sx={{
                  color: '#666',
                  fontWeight: 500,
                  '&:hover': { color: '#1a237e' },
                }}
              >
                À propos
              </Button>
              <Button
                sx={{
                  color: '#666',
                  fontWeight: 500,
                  '&:hover': { color: '#1a237e' },
                }}
              >
                Contact
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#1a237e',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#303f9f',
                  },
                }}
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: 12,
          pb: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  color: 'white',
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Gestion des Congés
                <br />
                <Box component="span" sx={{ color: '#e3f2fd' }}>
                  Simplifiée
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Automatisez vos processus RH avec notre plateforme moderne.
                Gestion efficace des congés, absences et ressources humaines.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: '#1a237e',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => navigate('/login')}
                >
                  Commencer maintenant
                  <ArrowForwardIcon sx={{ ml: 1 }} />
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <PlayArrowIcon sx={{ mr: 1 }} />
                  Voir la démo
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="Dashboard Preview"
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    p: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <IconButton
            sx={{
              color: 'white',
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(-10px)' },
                '60%': { transform: 'translateY(-5px)' },
              },
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Box>
      </Box>


      {/* Features Section */}
      <Box sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#212529',
              }}
            >
              Fonctionnalités Puissantes
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#6c757d',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Découvrez les outils qui révolutionnent la gestion RH
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <DashboardIcon sx={{ fontSize: 48 }} />,
                title: 'Tableaux de Bord',
                description: 'Visualisez vos données RH en temps réel avec des tableaux de bord intuitifs et personnalisables.',
                color: '#1a237e',
              },
              {
                icon: <ScheduleIcon sx={{ fontSize: 48 }} />,
                title: 'Gestion des Congés',
                description: 'Demandes, validations et suivi automatique des congés avec workflow intégré.',
                color: '#2e7d32',
              },
              {
                icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
                title: 'Rapports Avancés',
                description: 'Analysez les tendances et générez des rapports détaillés sur vos ressources humaines.',
                color: '#f57c00',
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 48 }} />,
                title: 'Sécurité Renforcée',
                description: 'Protection des données sensibles avec chiffrement et contrôles d\'accès avancés.',
                color: '#d32f2f',
              },
              {
                icon: <CloudIcon sx={{ fontSize: 48 }} />,
                title: 'Cloud Natif',
                description: 'Accès partout, tout le temps, avec synchronisation automatique et sauvegarde cloud.',
                color: '#1976d2',
              },
              {
                icon: <SupportIcon sx={{ fontSize: 48 }} />,
                title: 'Support 24/7',
                description: 'Assistance technique et formation continue pour maximiser votre productivité.',
                color: '#7b1fa2',
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: `${feature.color}15`,
                        color: feature.color,
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Avatar>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#212529',
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#6c757d',
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* User Roles Section */}
      <Box sx={{ py: 10, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#212529',
              }}
            >
              Accès par Profil
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#6c757d',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Chaque utilisateur accède à des fonctionnalités adaptées à son rôle
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {roles.map((role) => (
              <Grid item xs={12} md={4} key={role.id}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      borderColor: role.color,
                    },
                  }}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: role.gradient,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      }}
                    >
                      {role.icon}
                    </Avatar>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#212529',
                      }}
                    >
                      {role.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#6c757d',
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {role.description}
                    </Typography>

                    <Stack spacing={1} sx={{ mb: 4 }}>
                      {role.features.slice(0, 3).map((feature, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                          }}
                        >
                          <CheckCircleIcon sx={{ color: role.color, fontSize: 18 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#6c757d',
                              fontSize: '0.875rem',
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Button
                      variant="contained"
                      sx={{
                        background: role.gradient,
                        borderRadius: 2,
                        py: 1.5,
                        px: 4,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        '&:hover': {
                          background: role.gradient,
                          opacity: 0.9,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Accéder
                      <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, backgroundColor: '#1a237e', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            {[
              { number: '500+', label: 'Employés actifs' },
              { number: '10K+', label: 'Demandes traitées' },
              { number: '99.9%', label: 'Disponibilité' },
              { number: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: 'white',
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#212529',
              }}
            >
              Prêt à transformer votre gestion RH ?
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: '#6c757d',
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Rejoignez des centaines d'entreprises qui ont déjà digitalisé leurs processus RH
            </Typography>

            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#1a237e',
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(26, 35, 126, 0.3)',
                '&:hover': {
                  backgroundColor: '#303f9f',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(26, 35, 126, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/login')}
            >
              Commencer l'aventure
              <ArrowForwardIcon sx={{ ml: 1 }} />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#212529', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          {/* Description Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
              La Force d'un Réseau National pour Promouvoir le Secteur Privé
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Menu */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Menu
              </Typography>
              <Stack spacing={1}>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', p: 0, fontSize: '0.9rem' }}>
                  Accueil
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', p: 0, fontSize: '0.9rem' }}>
                  À propos de nous
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', p: 0, fontSize: '0.9rem' }}>
                  La FCCIM
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', p: 0, fontSize: '0.9rem' }}>
                  Le Dispositif d'Animation Commercial
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', p: 0, fontSize: '0.9rem' }}>
                  Actualités
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', p: 0, fontSize: '0.9rem' }}>
                  CCI Haute Matsiatra
                </Button>
              </Stack>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Adresse et Contact
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Lot SIAA 40, Ex SOMACODIS Analakely
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Tél. (+261) 34 05 526 25
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  federationcci@gmail.com
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Lundi au Vendredi de 8h 30 à 16h 30
                </Typography>
              </Stack>
            </Grid>

            {/* Ministries */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Ministères de tutelle
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Ministère de l'Industrie, du Commerce et de l'Artisanat
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Ministère de l'Economie et des Finances
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                  Ministère partenaire
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Ministère de l'Agriculture, de l'Elevage et de la Pêche
                </Typography>
              </Stack>
            </Grid>

            {/* Social Media */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Suivez-nous
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)', p: 1 }}>
                  <BusinessCenterIcon />
                </IconButton>
              </Stack>

              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', mb: 1 }}>
                Facebook
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Cookie Policy */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', mb: 2 }}>
              Confidentialité & Cookies : Ce site utilise des cookies. En continuant à utiliser ce site, vous acceptez leur utilisation.
              Pour en savoir davantage, y compris comment contrôler les cookies, voir : Politique relative aux cookies
            </Typography>
          </Box>

          {/* Copyright */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
              Copyright © CCI Haute Matsiatra 2025 – Tous droits réservés
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#1a237e',
          '&:hover': {
            backgroundColor: '#303f9f',
          },
        }}
        onClick={() => navigate('/login')}
      >
        <ArrowForwardIcon />
      </Fab>
    </Box>
  );
};

export default HomePage;
