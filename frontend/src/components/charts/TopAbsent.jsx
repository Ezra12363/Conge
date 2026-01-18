import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, CircularProgress } from '@mui/material';
import { getStats } from '../../api';

const TopAbsent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        setData(response.data.topAbsent || []);
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

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Employés les Plus Absents
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip />
          <Legend />
          <Bar dataKey="absences" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TopAbsent;
