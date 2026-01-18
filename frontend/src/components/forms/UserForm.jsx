import React, { useState } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Typography, Paper, Grid, Divider } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createUser, updateUser } from '../../api';
import { useSnackbar } from 'notistack';

const UserForm = ({ onSuccess, initialData }) => {
  const schema = yup.object({
    name: yup.string().required('Nom requis'),
    email: yup.string().email('Email invalide').required('Email requis'),
    password: initialData ? yup.string() : yup.string().required('Mot de passe requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: initialData ? yup.string() : yup.string().oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas').required('Confirmation du mot de passe requise'),
    role: yup.string().oneOf(['admin', 'rh', 'employe'], 'Rôle invalide').required('Rôle requis'),
    status: yup.string().oneOf(['active', 'inactive'], 'Statut invalide').required('Statut requis'),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      name: '',
      email: '',
      role: '',
      status: '',
    },
    context: { isEdit: !!initialData },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        // Update existing user - remove password if empty
        if (!data.password) {
          delete data.password;
        }
        await updateUser(initialData.id, data);
        enqueueSnackbar('Utilisateur mis à jour avec succès', { variant: 'success' });
      } else {
        // Create new user
        const userData = {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status,
        };

        await createUser(userData);
        enqueueSnackbar('Utilisateur créé avec succès', { variant: 'success' });
      }

      reset();
      onSuccess && onSuccess();
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([field, messages]) => {
          enqueueSnackbar(`${field}: ${messages.join(', ')}`, { variant: 'error' });
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* User Account Information Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            Informations du Compte Utilisateur
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />
          </Grid>
          {!initialData && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mot de passe"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmer le mot de passe"
                  type="password"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={loading}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role} disabled={loading}>
                  <InputLabel>Rôle</InputLabel>
                  <Select {...field} label="Rôle">
                    <MenuItem value="admin">ADMIN</MenuItem>
                    <MenuItem value="rh">RH</MenuItem>
                    <MenuItem value="employe">EMPLOYE</MenuItem>
                  </Select>
                  {errors.role && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>{errors.role.message}</p>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status} disabled={loading}>
                  <InputLabel>Statut</InputLabel>
                  <Select {...field} label="Statut">
                    <MenuItem value="active">ACTIVER</MenuItem>
                    <MenuItem value="inactive">DÉSACTIVER</MenuItem>
                  </Select>
                  {errors.status && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>{errors.status.message}</p>}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Paper>



      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{ mt: 2 }}
      >
        {loading ? 'Sauvegarde...' : (initialData ? 'Modifier' : 'Créer')}
      </Button>
    </Box>
  );
};

export default UserForm;
