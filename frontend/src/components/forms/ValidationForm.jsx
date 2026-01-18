import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  CircularProgress,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Divider,
  Alert,
  alpha,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Work,
  CalendarToday,
  Description,
  ThumbUp,
  ThumbDown,
  Warning,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createValidation, getSoldeConges } from '../../api';

const schema = yup.object({
  demande_id: yup.number().required('Demande ID requis'),
  decision: yup.string().required('Decision requis'),
  commentaire: yup.string(),
});

const ValidationForm = ({ demandeId, onSuccess, onError, requestData, employeeData, initialData }) => {
  const theme = useTheme();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      demande_id: demandeId,
      decision: initialData?.decision || 'approuvee',
      commentaire: initialData?.commentaire || ''
    },
  });

  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const watchedDecision = watch('decision');

  // Fetch employee balance data
  useEffect(() => {
    const fetchBalance = async () => {
      if (!employeeData?.id) return;

      setBalanceLoading(true);
      try {
        const balances = await getSoldeConges();
        const employeeBalance = balances.data?.find(balance => balance.employe_id === employeeData.id);
        setBalanceData(employeeBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [employeeData?.id]);

  // Check if employee has sufficient balance for approval
  const hasSufficientBalance = () => {
    if (!balanceData || !requestData) return true;

    const requestedDays = requestData.nombre_jours || 0;
    const requestType = requestData.typeDemande;

    if (requestType === 'conge') {
      return (balanceData.annual_leave || 0) >= requestedDays;
    } else if (requestType === 'absence') {
      return (balanceData.absence_leave || 0) >= requestedDays;
    }

    return true; // For maladie and other types, no balance check needed
  };

  const getBalanceWarning = () => {
    if (!balanceData || !requestData || watchedDecision !== 'approuvee') return null;

    const requestedDays = requestData.nombre_jours || 0;
    const requestType = requestData.typeDemande;

    if (requestType === 'conge') {
      const available = balanceData.annual_leave || 0;
      if (available < requestedDays) {
        return `⚠️ Solde insuffisant: ${available} jour(s) disponible(s) pour ${requestedDays} demandé(s)`;
      }
    } else if (requestType === 'absence') {
      const available = balanceData.absence_leave || 0;
      if (available < requestedDays) {
        return `⚠️ Solde insuffisant: ${available} jour(s) disponible(s) pour ${requestedDays} demandé(s)`;
      }
    }

    return null;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createValidation(data);
      const decisionText = data.decision === 'approuvee' ? 'approuvée' : 'refusée';
      onSuccess && onSuccess(`Demande ${decisionText} avec succès`);
    } catch (err) {
      console.error(err);
      onError && onError('Une erreur s\'est produite lors de la validation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionIcon = (decision) => {
    return decision === 'approuvee' ? <ThumbUp /> : <ThumbDown />;
  };

  const getDecisionColor = (decision) => {
    return decision === 'approuvee' ? 'success' : 'error';
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

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Employee and Request Summary */}
      {employeeData && requestData && (
        <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              Résumé de la demande
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                    width: 50,
                    height: 50
                  }}>
                    {employeeData.nom?.charAt(0)}{employeeData.prenom?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {employeeData.nom} {employeeData.prenom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employeeData.poste} • Matricule: {employeeData.im}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Type: {requestData.typeDemande === 'conge' ? 'Congé Annuel' :
                             requestData.typeDemande === 'absence' ? 'Absence' :
                             requestData.typeDemande === 'maladie' ? 'Congé Maladie' : requestData.typeDemande}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2">
                      {formatDate(requestData.dateDebut)} - {formatDate(requestData.dateFin)}
                      ({requestData.nombre_jours} jour{requestData.nombre_jours > 1 ? 's' : ''})
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Balance Information */}
              {balanceLoading ? (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress sx={{ flex: 1, height: 4, borderRadius: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      Chargement des soldes...
                    </Typography>
                  </Box>
                </Grid>
              ) : balanceData && (requestData.typeDemande === 'conge' || requestData.typeDemande === 'absence') && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccountBalanceWallet sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Soldes disponibles:
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {requestData.typeDemande === 'conge' && (
                      <Chip
                        label={`Congé annuel: ${balanceData.annual_leave || 0} jour(s)`}
                        variant="outlined"
                        sx={{
                          bgcolor: alpha(theme.palette.success.light, 0.1),
                          color: theme.palette.success.dark,
                          borderColor: theme.palette.success.main
                        }}
                      />
                    )}
                    {requestData.typeDemande === 'absence' && (
                      <Chip
                        label={`Absence: ${balanceData.absence_leave || 0} jour(s)`}
                        variant="outlined"
                        sx={{
                          bgcolor: alpha(theme.palette.warning.light, 0.1),
                          color: theme.palette.warning.dark,
                          borderColor: theme.palette.warning.main
                        }}
                      />
                    )}
                  </Stack>
                </Grid>
              )}

              {requestData.commentaire && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Description sx={{ color: 'primary.main', fontSize: 20, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Motif de la demande:
                      </Typography>
                      <Typography variant="body2" sx={{
                        bgcolor: alpha(theme.palette.grey[100], 0.5),
                        p: 2,
                        borderRadius: 2,
                        borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.5)}`
                      }}>
                        {requestData.commentaire}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Balance Warning Alert */}
      {getBalanceWarning() && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={600}>
            {getBalanceWarning()}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            L'approbation de cette demande entraînera un solde négatif. Considérez refuser la demande ou contacter l'employé.
          </Typography>
        </Alert>
      )}

      {/* Validation Form */}
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4] }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="primary" />
            Prendre une décision
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Veuillez sélectionner votre décision et ajouter un commentaire si nécessaire.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Décision"
                  {...register('decision')}
                  error={!!errors.decision}
                  helperText={errors.decision?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: getDecisionColor(watchedDecision) === 'success' ? theme.palette.success.main : theme.palette.error.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: getDecisionColor(watchedDecision) === 'success' ? theme.palette.success.main : theme.palette.error.main,
                      },
                    }
                  }}
                >
                  <MenuItem value="approuvee">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbUp sx={{ color: theme.palette.success.main }} />
                      <Typography>Approuver la demande</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="refusee">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbDown sx={{ color: theme.palette.error.main }} />
                      <Typography>Refuser la demande</Typography>
                    </Box>
                  </MenuItem>
                </TextField>

                {watchedDecision && (
                  <Alert
                    severity={getDecisionColor(watchedDecision)}
                    icon={getDecisionIcon(watchedDecision)}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {watchedDecision === 'approuvee'
                        ? '✅ Cette demande sera approuvée'
                        : '❌ Cette demande sera refusée'
                      }
                    </Typography>
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Commentaire (optionnel)"
                  multiline
                  rows={4}
                  {...register('commentaire')}
                  placeholder="Ajoutez un commentaire pour expliquer votre décision..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Le commentaire sera visible par l'employé et enregistré dans l'historique.
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  background: watchedDecision === 'approuvee'
                    ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  '&:hover': {
                    background: watchedDecision === 'approuvee'
                      ? 'linear-gradient(135deg, #38e972 0%, #2dd4aa 100%)'
                      : 'linear-gradient(135deg, #ee5a52 0%, #dc4545 100%)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  <>
                    {getDecisionIcon(watchedDecision)}
                    <Typography sx={{ ml: 1 }}>
                      {watchedDecision === 'approuvee' ? 'Approuver' : 'Refuser'} la demande
                    </Typography>
                  </>
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ValidationForm;
