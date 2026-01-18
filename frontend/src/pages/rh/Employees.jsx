import React, { useState } from 'react';
import { Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageWrapper from '../../components/layout/PageWrapper';
import EmployeeTable from '../../components/tables/EmployeeTable';
import EmployeeForm from '../../components/forms/EmployeeForm';

const Employees = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  return (
    <PageWrapper>
      <Container maxWidth="xl">


        {/* Dynamic Employee Table with server-side operations */}
        <EmployeeTable
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          refreshTrigger={refreshTrigger}
          showBulkActions={true}
        />

        {/* Employee Form Dialog */}
        <Dialog
          open={showForm}
          onClose={handleFormCancel}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedEmployee ? 'Modifier Employé' : 'Nouveau Employé'}
          </DialogTitle>
          <DialogContent>
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
