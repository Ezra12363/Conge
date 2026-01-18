import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Alert,
  IconButton,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Close,
  CalendarToday,
  LocationOn,
  Description,
  AttachFile,
  CheckCircle,
  Warning,
  BeachAccess,
  Work,
  Send,
  AccessTime,
  ArrowForward
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { createDemande, updateDemande, getSoldeConges, getSoldeConge, updateSoldeConge } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const schema = yup.object({
  type: yup.string().required('Type requis'),
  annees_demande: yup.number().required('Année de demande requise'),
  droit_conge: yup.number().required('Droit congé requis'),
  lieu_demande: yup.string().required('Lieu de demande requis'),
  date_debut: yup.date().required('Date de début requise'),
  date_fin: yup.date().required('Date de fin requise').min(yup.ref('date_debut'), 'Date de fin doit être après la date de début'),
  motif: yup.string().required('Motif requis').min(20, 'Le motif doit contenir au moins 20 caractères'),
});

const LeaveForm = ({ onSuccess, onClose, initialData, isEdit = false, requestType, availableBalance }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [balances, setBalances] = useState({ annual_leave: 0, absence_leave: 0 });
  const [requiresJustification, setRequiresJustification] = useState(false);
  const [justificationFile, setJustificationFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [calculatedDays, setCalculatedDays] = useState(0);

  const steps = ['Type & Période', 'Détails', 'Justification', 'Confirmation'];

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: requestType || 'conge',
      annees_demande: new Date().getFullYear(),
      droit_conge: availableBalance || 30,
      lieu_demande: 'Bureau',
      motif: '',
      ...(initialData || {})
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        date_debut: initialData.dateDebut ? new Date(initialData.dateDebut) : null,
        date_fin: initialData.dateFin ? new Date(initialData.dateFin) : null,
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (requestType) {
      setValue('type', requestType);
    }
  }, [requestType, setValue]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        if (user) {
          const response = await getSoldeConges();
          const employeeId = user?.employe?.id || user?.employee?.id || user?.id;
          const userBalance = response.data?.find(b => b.employe_id === employeeId);
          if (userBalance) {
            setBalances({
              annual_leave: userBalance.annual_leave || 0,
              absence_leave: userBalance.absence_leave || 0
            });
            // Set droit_conge to the user's annual leave balance
            const newBalance = requestType === 'conge' ? userBalance.annual_leave : 
                              requestType === 'absence' ? userBalance.absence_leave : 
                              availableBalance || 30;
            setValue('droit_conge', newBalance);
          }
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
      }
    };
    fetchBalances();
  }, [user, setValue, requestType, availableBalance]);

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') + 1;
  };

  const watchedType = watch('type');
  const watchedStartDate = watch('date_debut');
  const watchedEndDate = watch('date_fin');
  const watchedLieu = watch('lieu_demande');
  const watchedMotif = watch('motif');

  useEffect(() => {
    const days = calculateDays(watchedStartDate, watchedEndDate);
    setCalculatedDays(days);
    
    // Check if justification is required based on leave type and duration
    // Maintenant seulement pour les absences de plus de 1 jour
    const requiresJustification = (watchedType === 'absence' && days > 1);
    setRequiresJustification(requiresJustification);
  }, [watchedType, watchedStartDate, watchedEndDate]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'conge': return <BeachAccess />;
      case 'absence': return <Work />;
      default: return <BeachAccess />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'conge': return '#667eea';
      case 'absence': return '#f5576c';
      default: return '#667eea';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'conge': return 'Congé Annuel';
      case 'absence': return 'Absence';
      default: return type;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJustificationFile(file);
      setFileName(file.name);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        enqueueSnackbar('Vous devez être connecté pour soumettre une demande', { variant: 'error' });
        return;
      }

      // Validate dates before proceeding
      if (!data.date_debut || !data.date_fin || !dayjs(data.date_debut).isValid() || !dayjs(data.date_fin).isValid()) {
        enqueueSnackbar('Dates invalides. Veuillez sélectionner des dates valides.', { variant: 'error' });
        return;
      }

      if (dayjs(data.date_fin).isBefore(dayjs(data.date_debut))) {
        enqueueSnackbar('La date de fin doit être après ou égale à la date de début.', { variant: 'error' });
        return;
      }

      // Calculate requested days
      const daysRequested = calculateDays(data.date_debut, data.date_fin);

      // Check balance before submission
      if (data.type === 'conge' && balances.annual_leave < daysRequested) {
        enqueueSnackbar(`Solde insuffisant pour congé annuel. Solde disponible: ${balances.annual_leave} jours, demandé: ${daysRequested} jours.`, { variant: 'error' });
        return;
      }
      if (data.type === 'absence' && balances.absence_leave < daysRequested) {
        enqueueSnackbar(`Solde insuffisant pour absence. Solde disponible: ${balances.absence_leave} jours, demandé: ${daysRequested} jours.`, { variant: 'error' });
        return;
      }

      const requestData = {
        typeDemande: data.type,
        annees_demande: data.annees_demande,
        droit_conge: data.droit_conge,
        lieu_demande: data.lieu_demande,
        dateDebut: dayjs(data.date_debut).format('YYYY-MM-DD'),
        dateFin: dayjs(data.date_fin).format('YYYY-MM-DD'),
        commentaire: data.motif,
        user_id: user.id,
      };

      // Handle balance updates for editing
      if (isEdit && initialData) {
        const oldDays = calculateDays(dayjs(initialData.dateDebut), dayjs(initialData.dateFin));
        const newDays = calculateDays(dayjs(data.date_debut), dayjs(data.date_fin));

        if (initialData.statut === 'approuvee' && (oldDays !== newDays || initialData.typeDemande !== data.type)) {
          const balanceResponse = await getSoldeConge(user.employe.id);
          const currentBalance = balanceResponse.data;

          const restoreDays = initialData.typeDemande === 'conge' ? oldDays : 0;
          const restoreAbsenceDays = initialData.typeDemande === 'absence' ? oldDays : 0;
          const deductDays = data.type === 'conge' ? newDays : 0;
          const deductAbsenceDays = data.type === 'absence' ? newDays : 0;

          const updatedBalance = {
            ...currentBalance,
            annual_leave: currentBalance.annual_leave + restoreDays - deductDays,
            absence_leave: currentBalance.absence_leave + restoreAbsenceDays - deductAbsenceDays
          };

          await updateSoldeConge(user.employe.id, updatedBalance);
        }
      }

      let response;
      if (justificationFile) {
        const formData = new FormData();
        Object.keys(requestData).forEach(key => {
          formData.append(key, requestData[key]);
        });
        formData.append('justification', justificationFile);

        if (isEdit && initialData) {
          response = await updateDemande(initialData.id, formData);
        } else {
          response = await createDemande(formData);
        }
      } else {
        if (isEdit && initialData) {
          response = await updateDemande(initialData.id, requestData);
        } else {
          response = await createDemande(requestData);
        }
      }

      // Display success message with balance information
      const successMessage = isEdit ? 'Demande modifiée avec succès' : 'Demande soumise avec succès';
      enqueueSnackbar(successMessage, { variant: 'success' });

      // Display remaining balance information if available
      if (response?.data?.solde_restant) {
        const { annual_leave, absence_leave, note } = response.data.solde_restant;
        setTimeout(() => {
          enqueueSnackbar(
            `Solde restant - Congé annuel: ${annual_leave} jours, Absence: ${absence_leave} jours`,
            { variant: 'info', autoHideDuration: 8000 }
          );
          if (note) {
            setTimeout(() => {
              enqueueSnackbar(note, { variant: 'info', autoHideDuration: 6000 });
            }, 2000);
          }
        }, 1000);
      }

      onSuccess && onSuccess();
    } catch (err) {
      console.error('Error submitting request:', err);
      if (err.response?.status === 401) {
        enqueueSnackbar('Session expirée. Veuillez vous reconnecter.', { variant: 'error' });
      } else if (err.response?.status === 404) {
        enqueueSnackbar('Profil employé non trouvé. Contactez l\'administrateur.', { variant: 'error' });
      } else if (err.response?.status === 400) {
        enqueueSnackbar(err.response.data?.message || 'Erreur de validation', { variant: 'error' });
      } else if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(', ');
          enqueueSnackbar(`Erreurs de validation: ${errorMessages}`, { variant: 'error' });
        } else {
          enqueueSnackbar(err.response.data?.message || 'Erreur de validation', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Erreur lors de la soumission de la demande', { variant: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Type de demande
              </Typography>
              <Grid container spacing={2}>
                {/* Seulement Congé Annuel et Absence */}
                {['conge', 'absence'].map((type) => (
                  <Grid item xs={12} sm={6} key={type}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: watchedType === type ? getTypeColor(type) : 'transparent',
                        backgroundColor: watchedType === type ? alpha(getTypeColor(type), 0.1) : 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => setValue('type', type)}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: getTypeColor(type),
                            width: 56,
                            height: 56,
                            mb: 2,
                            mx: 'auto'
                          }}
                        >
                          {getTypeIcon(type)}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          {getTypeLabel(type)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type === 'conge' && 'Congés payés annuels'}
                          {type === 'absence' && 'Absences autorisées'}
                        </Typography>
                        {type === 'conge' && balances.annual_leave !== undefined && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Solde disponible: 
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {balances.annual_leave} jours
                            </Typography>
                          </Box>
                        )}
                        {type === 'absence' && balances.absence_leave !== undefined && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Solde disponible: 
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              {balances.absence_leave} jours
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Période de congé
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date de début"
                    value={watchedStartDate ? dayjs(watchedStartDate) : null}
                    onChange={(date) => setValue('date_debut', date ? date.toDate() : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.date_debut}
                        helperText={errors.date_debut?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date de fin"
                    value={watchedEndDate ? dayjs(watchedEndDate) : null}
                    onChange={(date) => setValue('date_fin', date ? date.toDate() : null)}
                    minDate={watchedStartDate ? dayjs(watchedStartDate) : undefined}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.date_fin}
                        helperText={errors.date_fin?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {calculatedDays > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity="info"
                    icon={<AccessTime />}
                    sx={{
                      backgroundColor: alpha('#1976d2', 0.1),
                      '& .MuiAlert-icon': { color: '#1976d2' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={600}>
                        Durée demandée
                      </Typography>
                      <Chip
                        label={`${calculatedDays} jour${calculatedDays > 1 ? 's' : ''}`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    {watchedType === 'conge' && balances.annual_leave !== undefined && calculatedDays > balances.annual_leave && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Attention: Vous demandez plus de jours ({calculatedDays}) que votre solde disponible ({balances.annual_leave} jours)
                      </Alert>
                    )}
                    {watchedType === 'absence' && balances.absence_leave !== undefined && calculatedDays > balances.absence_leave && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Attention: Vous demandez plus de jours ({calculatedDays}) que votre solde disponible ({balances.absence_leave} jours)
                      </Alert>
                    )}
                  </Alert>
                </Box>
              )}
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
             
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Lieu de demande"
                value={watchedLieu || ''}
                {...register('lieu_demande')}
                error={!!errors.lieu_demande}
                helperText={errors.lieu_demande?.message}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <MenuItem value="Bureau">Bureau</MenuItem>
                <MenuItem value="Domicile">Domicile</MenuItem>
                <MenuItem value="Télétravail">Télétravail</MenuItem>
                <MenuItem value="En déplacement">En déplacement</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Année de demande"
                type="number"
                {...register('annees_demande')}
                error={!!errors.annees_demande}
                helperText={errors.annees_demande?.message}
                InputProps={{
                  readOnly: true,
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={`Droit ${watchedType === 'conge' ? 'congé' : 'absence'} disponible`}
                type="number"
                value={watchedType === 'conge' ? balances.annual_leave : balances.absence_leave}
                InputProps={{
                  readOnly: true,
                  startAdornment: <CheckCircle sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
              />

              {/* Hidden field - Droit congé utilisé pour cette demande */}
              <TextField
                fullWidth
                label="Droit congé utilisé pour cette demande"
                type="number"
                {...register('droit_conge')}
                error={!!errors.droit_conge}
                helperText={errors.droit_conge?.message}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: watchedType === 'conge' ? balances.annual_leave : balances.absence_leave
                  }
                }}
                sx={{ display: 'none' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motif de la demande"
                multiline
                rows={4}
                {...register('motif')}
                error={!!errors.motif}
                helperText={`${errors.motif?.message || ''} ${watchedMotif ? `(${watchedMotif.length}/20 caractères minimum)` : ''}`}
                placeholder={`Veuillez décrire en détail le motif de votre demande de ${watchedType === 'conge' ? 'congé annuel' : 'absence'}...`}
                InputProps={{
                  startAdornment: <Description sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                }}
                inputProps={{ maxLength: 500 }}
              />
              {watchedMotif && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((watchedMotif.length / 20) * 100, 100)}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha('#ccc', 0.3),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: watchedMotif.length >= 20 ? '#43e97b' : '#f5576c',
                        borderRadius: 2
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {watchedMotif.length} caractères
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {watchedMotif.length >= 20 ? 'Minimum atteint ✓' : `Encore ${20 - watchedMotif.length} caractères`}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Pièces justificatives
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {requiresJustification 
                  ? 'Une pièce justificative est obligatoire pour les absences de plus de 1 jour.'
                  : 'L\'ajout d\'une pièce justificative est facultatif mais recommandé pour accélérer le traitement.'
                }
              </Typography>

              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: alpha('#1976d2', 0.05)
                  }
                }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <AttachFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {fileName ? fileName : 'Cliquez pour sélectionner un fichier'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Formats acceptés : PDF, JPG, PNG, DOC, DOCX (max. 5MB)
                </Typography>
                {fileName && (
                  <Chip
                    label="Fichier sélectionné"
                    color="success"
                    size="small"
                    sx={{ mt: 2 }}
                    onDelete={() => {
                      setJustificationFile(null);
                      setFileName('');
                    }}
                  />
                )}
              </Box>

              {requiresJustification && !justificationFile && (
                <Alert
                  severity="warning"
                  icon={<Warning />}
                  sx={{ mt: 3 }}
                >
                  Une pièce justificative est requise pour les absences de plus d'un jour.
                </Alert>
              )}
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Récapitulatif de votre demande
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Veuillez vérifier toutes les informations avant de soumettre votre demande
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: alpha(getTypeColor(watchedType), 0.1),
                border: `1px solid ${alpha(getTypeColor(watchedType), 0.3)}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: getTypeColor(watchedType),
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      {getTypeIcon(watchedType)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {getTypeLabel(watchedType)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type de demande sélectionné
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={calculatedDays > 0 ? `${calculatedDays} jour${calculatedDays > 1 ? 's' : ''}` : 'Durée non définie'}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <CalendarToday sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Période
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {watchedStartDate ? dayjs(watchedStartDate).format('DD/MM/YYYY') : 'Non défini'} 
                        {' → '}
                        {watchedEndDate ? dayjs(watchedEndDate).format('DD/MM/YYYY') : 'Non défini'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Lieu de demande
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {watchedLieu || 'Non spécifié'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Année
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {watch('annees_demande')}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Droit utilisé
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {watch('droit_conge')} jour(s)
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <Description sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Motif
                      </Typography>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: alpha('#000', 0.03), 
                        borderRadius: 1,
                        borderLeft: `3px solid ${alpha(getTypeColor(watchedType), 0.5)}`
                      }}>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                          "{watchedMotif || 'Non spécifié'}"
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <AttachFile sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Pièce jointe
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {fileName || 'Aucun fichier joint'}
                      </Typography>
                    </Grid>


                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return watchedType && watchedStartDate && watchedEndDate && !errors.date_debut && !errors.date_fin;
      case 1:
        return watchedLieu && watchedMotif && watchedMotif.length >= 20;
      case 2:
        return !requiresJustification || (requiresJustification && justificationFile);
      default:
        return true;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              {isEdit ? 'Modifier la demande' : 'Nouvelle demande'}
            </Typography>
            {onClose && (
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.1)
                  }
                }}
              >
                <Close />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="body1" color="text.secondary">
            Remplissez les informations ci-dessous pour soumettre votre demande
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
          >
            Retour
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={!isStepValid(activeStep)}
              endIcon={<ArrowForward />}
              sx={{
                background: `linear-gradient(135deg, ${getTypeColor(watchedType)} 0%, ${alpha(getTypeColor(watchedType), 0.7)} 100%)`,
              }}
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isStepValid(activeStep)}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
              sx={{
                background: `linear-gradient(135deg, ${getTypeColor(watchedType)} 0%, ${alpha(getTypeColor(watchedType), 0.7)} 100%)`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              {isSubmitting ? 'Soumission en cours...' : (isEdit ? 'Modifier la demande' : 'Soumettre la demande')}
            </Button>
          )}
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Étape {activeStep + 1} sur {steps.length} • {Math.round(((activeStep + 1) / steps.length) * 100)}% complet
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveForm;