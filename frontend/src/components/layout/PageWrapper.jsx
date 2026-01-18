import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageWrapper = ({ children }) => {
  // Initialize sidebar state from localStorage or default to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} onClose={handleToggleSidebar} />

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // hauteur Navbar
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)', // Full height minus navbar
        }}
      >
        <Navbar onToggleSidebar={handleToggleSidebar} />
        {children}
      </Box>

    </Box>
  );
};

export default PageWrapper;
