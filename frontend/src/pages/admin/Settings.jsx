import React, { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Box } from '@mui/material';
import PageWrapper from '../../components/layout/PageWrapper';

const Settings = () => {
  const [settings, setSettings] = useState({
    maxConges: 30,
    maxAbsences: 15,
    // other settings
  });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Save settings to API
    console.log('Settings saved:', settings);
  };

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Paramètres Système
        </Typography>
        <Typography variant="h6" gutterBottom>
          Politiques de Congés et Absences
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nombre maximum de congés annuels"
            name="maxConges"
            type="number"
            value={settings.maxConges}
            onChange={handleChange}
          />
          <TextField
            label="Nombre maximum d'absences"
            name="maxAbsences"
            type="number"
            value={settings.maxAbsences}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleSave}>
            Sauvegarder
          </Button>
        </Box>
      </Container>
    </PageWrapper>
  );
};

export default Settings;
