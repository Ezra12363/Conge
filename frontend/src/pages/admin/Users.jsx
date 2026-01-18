import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { getUsers, deleteUser, resetPassword, toggleStatus } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';
import UserTable from '../../components/tables/UserTable';
import UserForm from '../../components/forms/UserForm';
import { useAuth } from '../../contexts/AuthContext';

const Users = () => {
  const { user, loading: authLoading } = useAuth();
  const [usersData, setUsersData] = useState({
    data: [],
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    filters: {}
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    if (!user) return; // Don't fetch if not authenticated

    setLoading(true);
    try {
      const response = await getUsers(params);
      setUsersData(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsers();
    }
  }, [user, authLoading, fetchUsers]);

  // Handle dynamic filtering and sorting
  const handleUsersChange = (filters) => {
    fetchUsers(filters);
  };

  // Handle pagination changes
  const handlePaginationChange = (newPagination) => {
    fetchUsers({
      page: newPagination.current_page,
      per_page: newPagination.per_page
    });
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      // Refresh users data
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (id) => {
    try {
      await resetPassword(id);
      // Refresh users data
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleStatus(id);
      // Refresh users data
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUser(null);
    // Refresh data
    fetchUsers();
  };

  return (
    <PageWrapper>
      <Box sx={{ px: 3 }}>
        <UserTable
          users={usersData.data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
          onToggleStatus={handleToggleStatus}
          onUsersChange={handleUsersChange}
          pagination={usersData}
          onPaginationChange={handlePaginationChange}
          onCreate={handleCreate}
        />
        <Dialog open={showForm} onClose={() => setShowForm(false)}>
          <DialogTitle>{selectedUser ? 'Modifier Utilisateur' : 'Nouveau Utilisateur'}</DialogTitle>
          <DialogContent>
            <UserForm onSuccess={handleFormSuccess} initialData={selectedUser} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Annuler</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  );
};

export default Users;
