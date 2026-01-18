import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, CircularProgress, Box } from '@mui/material';
import { getStats } from '../../api';

const LeaveChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        // Assuming response.data.conges is an array of { month: 'Jan', count: 10 }
        setData(response.data.conges || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Statistiques des Congés
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default LeaveChart;
