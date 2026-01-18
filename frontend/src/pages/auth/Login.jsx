import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';

const Login = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <LoginForm selectedRole={null} onBack={handleBack} />;
};

export default Login;
