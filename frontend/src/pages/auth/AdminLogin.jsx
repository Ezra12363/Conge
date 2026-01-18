import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis'),
});

const AdminLogin = ({ onBack }) => {
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');

      const response = await login(data);

      // Check if user has admin role
      if (response.user?.role !== 'admin') {
        setError('Accès non autorisé. Cette page est réservée aux administrateurs.');
        return;
      }

      setSuccess('Connexion administrateur réussie ! Redirection en cours...');

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Admin login error:', err);
      setSuccess('');

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        if (status === 401) {
          if (errorData.message?.includes('deactivated')) {
            setError('Votre compte administrateur a été désactivé. Contactez le support.');
          } else {
            setError('Email ou mot de passe administrateur incorrect.');
          }
        } else if (status === 422) {
          setError('Veuillez vérifier vos informations administrateur.');
        } else if (status >= 500) {
          setError('Erreur du serveur. Veuillez réessayer plus tard.');
        } else {
          setError(errorData.message || 'Erreur de connexion administrateur inattendue.');
        }
      } else if (err.request) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      } else {
        setError('Une erreur inattendue s\'est produite.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          position: 'relative',
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
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="MyPyli Logo"
            sx={{
              width: 120,
              height: 120,
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              p: 2,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
           CCI 
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              maxWidth: 300,
              lineHeight: 1.6,
            }}
          >
            Administration Système
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Admin Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          minWidth: { xs: '100%', md: '400px' },
        }}
      >


        {/* Back Button */}
        <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Retour à l'accueil
          </Button>
        </Box>

        {/* Admin Login Card */}
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            borderRadius: 3,
            border: '1px solid #e9ecef',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AdminIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#212529',
                  mb: 1,
                }}
              >
                Connexion Administrateur
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6c757d',
                }}
              >
                Accès au panneau d'administration
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Email administrateur"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a237e',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ color: '#6c757d', mr: 1 }} />
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Mot de passe administrateur"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a237e',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ color: '#6c757d', mr: 1 }} />
                    ),
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#6c757d' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 4, textAlign: 'right' }}>
                <Button
                  variant="text"
                  sx={{
                    color: '#1a237e',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.04)',
                      color: '#3949ab',
                    },
                  }}
                  onClick={() => {
                    console.log('Forgot admin password clicked');
                  }}
                >
                  Mot de passe oublié ?
                </Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loginLoading || isSubmitting}
                sx={{
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                    opacity: 0.9,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(26, 35, 126, 0.4)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loginLoading || isSubmitting ? 'Connexion en cours...' : 'Se connecter en tant qu\'administrateur'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminLogin;
