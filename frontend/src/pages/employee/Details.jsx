import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getEmploye } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';

const Details = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get employee details using the employee relationship from user
        const employeeId = user?.employee?.id;
        if (!employeeId) {
          throw new Error('Employee information not found');
        }

        const response = await getEmploye(employeeId);
        setEmployee(response.data);
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError('Erreur lors du chargement des détails de l\'employé');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmployeeDetails();
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </PageWrapper>
    );
  }

  if (!employee) {
    return (
      <PageWrapper>
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mt: 2 }}>
            Aucune information d'employé trouvée
          </Alert>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Mes Informations
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, textAlign: 'center', pt: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {getInitials(employee.nom, employee.prenom)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {employee.nom} {employee.prenom}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {employee.poste || 'Poste non spécifié'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IM: {employee.im}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Informations Personnelles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nom complet
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {employee.nom} {employee.prenom}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sexe
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {employee.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date de naissance
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(employee.date_naissance)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date de prise de service
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(employee.date_prise_service)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Professional Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Informations Professionnelles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ '& > div': { mb: 2 } }}>
                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Poste
                    </Typography>
                    <Typography variant="body1">
                      {employee.poste || 'Non spécifié'}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Corps
                    </Typography>
                    <Typography variant="body1">
                      {employee.corps || 'Non spécifié'}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Grades
                    </Typography>
                    <Typography variant="body1">
                      {employee.grades || 'Non spécifié'}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Type de personnel
                    </Typography>
                    <Typography variant="body1">
                      {employee.types_personnel || 'Non spécifié'}
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Informations Système
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ '& > div': { mb: 2 } }}>
                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Identifiant (IM)
                    </Typography>
                    <Typography variant="body1">
                      {employee.im}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Rôle
                    </Typography>
                    <Typography variant="body1">
                      {employee.role || 'employe'}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Date de création
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(employee.created_at)}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Dernière modification
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(employee.updated_at)}
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </PageWrapper>
  );
};

export default Details;
