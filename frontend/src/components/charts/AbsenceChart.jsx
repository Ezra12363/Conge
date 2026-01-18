import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, CircularProgress } from '@mui/material';
import { getStats } from '../../api';

const AbsenceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        // Assuming response.data.absences is an array of { month: 'Jan', count: 10 }
        setData(response.data.absences || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Statistiques des Absences
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

export default AbsenceChart;
