import React, { useState } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createEmploye, updateEmploye } from '../../api';
import { useSnackbar } from 'notistack';

const schema = yup.object({
  im: yup.string().required('IM requis'),
  nom: yup.string().required('Nom requis'),
  prenom: yup.string().required('Prénom requis'),
  corps: yup.string().nullable(),
  grades: yup.string().nullable(),
  sexe: yup.string().oneOf(['M', 'F'], 'Sexe invalide').required('Sexe requis'),
  types_personnel: yup.string().nullable(),
  date_naissance: yup.date().nullable(),
  date_prise_service: yup.date().nullable(),
  poste: yup.string().nullable(),
  role: yup.string().oneOf(['admin', 'rh', 'responsable', 'employe'], 'Rôle invalide').nullable(),
});

const EmployeeForm = ({ onSuccess, onError, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {},
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (initialData?.id) {
        // Update existing employee
        await updateEmploye(initialData.id, data);
        enqueueSnackbar('Employé mis à jour avec succès', { variant: 'success' });
      } else {
        // Create new employee
        await createEmploye(data);
        enqueueSnackbar('Employé créé avec succès', { variant: 'success' });
      }

      reset(); // Reset form
      onSuccess && onSuccess(data); // Pass the data to parent for modal closing and table refresh
    } catch (err) {
      console.error('Employee form error:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la sauvegarde';
      enqueueSnackbar(errorMessage, { variant: 'error' });

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([field, messages]) => {
          enqueueSnackbar(`${field}: ${messages.join(', ')}`, { variant: 'error' });
        });
      }

      onError && onError(err); // Pass error to parent if needed
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel && onCancel();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="IM"
        {...register('im')}
        error={!!errors.im}
        helperText={errors.im?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Nom"
        {...register('nom')}
        error={!!errors.nom}
        helperText={errors.nom?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Prénom"
        {...register('prenom')}
        error={!!errors.prenom}
        helperText={errors.prenom?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Corps"
        {...register('corps')}
        error={!!errors.corps}
        helperText={errors.corps?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Grades"
        {...register('grades')}
        error={!!errors.grades}
        helperText={errors.grades?.message}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sexe</InputLabel>
        <Select
          {...register('sexe')}
          value={watch('sexe') || ''}
          onChange={(e) => setValue('sexe', e.target.value)}
          error={!!errors.sexe}
        >
          <MenuItem value="M">Masculin</MenuItem>
          <MenuItem value="F">Féminin</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Type de Personnel"
        {...register('types_personnel')}
        error={!!errors.types_personnel}
        helperText={errors.types_personnel?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Date de Naissance"
        type="date"
        {...register('date_naissance')}
        error={!!errors.date_naissance}
        helperText={errors.date_naissance?.message}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Date de Prise de Service"
        type="date"
        {...register('date_prise_service')}
        error={!!errors.date_prise_service}
        helperText={errors.date_prise_service?.message}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Poste"
        {...register('poste')}
        error={!!errors.poste}
        helperText={errors.poste?.message}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Rôle</InputLabel>
        <Select
          {...register('role')}
          value={watch('role') || ''}
          onChange={(e) => setValue('role', e.target.value)}
          error={!!errors.role}
        >
          <MenuItem value="">Aucun</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="rh">RH</MenuItem>
          <MenuItem value="responsable">Responsable</MenuItem>
          <MenuItem value="employe">Employé</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Sauvegarde...' : (initialData ? 'Modifier' : 'Créer')}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleCancel}
          disabled={loading}
        >
          Annuler
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeForm;
