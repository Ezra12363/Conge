import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Dialog, DialogTitle, DialogContent,
  Grid, Card, CardContent, Avatar, Chip, TextField, InputAdornment
} from '@mui/material';
import { Box } from '@mui/material';
import {
  Add, People, PersonAdd, Business, Search, TrendingUp,
  Work, CalendarToday, LocationOn
} from '@mui/icons-material';
import PageWrapper from '../../components/layout/PageWrapper';
import EmployeeTable from '../../components/tables/EmployeeTable';
import EmployeeForm from '../../components/forms/EmployeeForm';
import { getEmployes } from '../../api';

const Employees = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployes();
        setEmployees(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [refreshTrigger]);

  const handleCreate = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleView = (employee) => {
    // Display employee details in a formatted alert
    const details = `
Détails de l'employé:
IM: ${employee.im}
Nom: ${employee.nom}
Prénom: ${employee.prenom}
Corps: ${employee.corps || 'N/A'}
Grades: ${employee.grades || 'N/A'}
Sexe: ${employee.sexe === 'M' ? 'Masculin' : 'Féminin'}
Type de Personnel: ${employee.types_personnel || 'N/A'}
Date de Naissance: ${employee.date_naissance || 'N/A'}
Date de Prise de Service: ${employee.date_prise_service || 'N/A'}
Poste: ${employee.poste || 'N/A'}
Rôle: ${employee.role || 'N/A'}
    `.trim();
    alert(details);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (employee) => {
    // The delete confirmation is handled within the EmployeeTable component
    // This callback is called after successful deletion to refresh the table
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedEmployee(null);
    // Trigger table refresh
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.im?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.statut === 'actif').length,
    departments: new Set(employees.map(emp => emp.departement)).size,
    newThisMonth: employees.filter(emp => {
      const joinDate = new Date(emp.date_prise_service);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <PageWrapper>
      <Container maxWidth="xl">
        {/* Header Section */}
       

        {/* Employee Table */}
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <EmployeeTable
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              refreshTrigger={refreshTrigger}
              showBulkActions={true}
            />
          </CardContent>
        </Card>

        {/* Employee Form Dialog */}
        <Dialog
          open={showForm}
          onClose={handleFormCancel}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 3,
              boxShadow: 6
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {selectedEmployee ? 'Modifier Employé' : 'Nouveau Employé'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <EmployeeForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              initialData={selectedEmployee}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </PageWrapper>
  );
};

export default Employees;
