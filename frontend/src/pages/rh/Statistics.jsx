import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import LeaveChart from '../../components/charts/LeaveChart';
import AbsenceChart from '../../components/charts/AbsenceChart';
import TopAbsent from '../../components/charts/TopAbsent';
import PageWrapper from '../../components/layout/PageWrapper';

const Statistics = () => {
  return (
    <PageWrapper>
      <Container 
        maxWidth="xl" 
        sx={{ 
          height: 'calc(100vh - 64px)', // Ajuste selon la hauteur de ton header
          py: 3
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Statistiques RH
        </Typography>
        
        <Grid 
          container 
          spacing={3}
          sx={{ 
            height: 'calc(100% - 48px)' // Ajuste selon la hauteur du titre
          }}
        >
          {/* Deux premiers graphiques - 40% chacun */}
          <Grid item xs={12} md={6} sx={{ height: '40%' }}>
            <Box 
              sx={{ 
                height: '100%',
                width: '100%',
                position: 'relative'
              }}
            >
              <LeaveChart 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ height: '40%' }}>
            <Box 
              sx={{ 
                height: '100%',
                width: '100%',
                position: 'relative'
              }}
            >
              <AbsenceChart 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                }} 
              />
            </Box>
          </Grid>
          
          {/* Dernier graphique - 60% */}
          <Grid item xs={12} sx={{ height: '60%' }}>
            <Box 
              sx={{ 
                height: '100%',
                width: '100%',
                position: 'relative'
              }}
            >
              <TopAbsent 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                }} 
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PageWrapper>
  );
};

export default Statistics;