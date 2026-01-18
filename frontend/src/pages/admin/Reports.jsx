import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TablePagination
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Article as TxtIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getRapports, createRapport, getDemandes, deleteRapport } from '../../api';
import PageWrapper from '../../components/layout/PageWrapper';
import LeaveChart from '../../components/charts/LeaveChart';
import TopAbsent from '../../components/charts/TopAbsent';

const Reports = () => {
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialog, setViewDialog] = useState({
    open: false,
    report: null
  });
  const [exportDialog, setExportDialog] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    type: '',
    department: ''
  });

  const [reportFilters, setReportFilters] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    user: ''
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on reportFilters
  const filteredReports = reports.filter(report => {
    if (reportFilters.type && report.type !== reportFilters.type) return false;
    if (reportFilters.dateFrom) {
      const reportDate = new Date(report.date_generation);
      const filterDate = new Date(reportFilters.dateFrom);
      if (reportDate < filterDate) return false;
    }
    if (reportFilters.dateTo) {
      const reportDate = new Date(report.date_generation);
      const filterDate = new Date(reportFilters.dateTo);
      if (reportDate > filterDate) return false;
    }
    if (reportFilters.user) {
      const userName = `${report.user?.nom || ''} ${report.user?.prenom || ''}`.toLowerCase();
      if (!userName.includes(reportFilters.user.toLowerCase())) return false;
    }
    return true;
  });

  const paginatedReports = filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRapports();
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await createRapport({
        titre: 'Rapport Mensuel - ' + new Date().toLocaleDateString('fr-FR'),
        contenu: 'Rapport généré automatiquement',
        type: 'monthly',
        date_generation: new Date().toISOString().split('T')[0],
        user_id: JSON.parse(localStorage.getItem('user') || '{}').id
      });
      // Refresh reports list
      fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Erreur lors de la génération du rapport');
    }
  };

  const handleViewReport = (report) => {
    setViewDialog({
      open: true,
      report: report
    });
  };

  const handleDownloadReport = (report) => {
    try {
      // Create a blob with the report content
      const content = typeof report.contenu === 'string' ? report.contenu : JSON.stringify(report.contenu, null, 2);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.titre.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Erreur lors du téléchargement du rapport');
    }
  };

  const handleDownloadPdf = async (report) => {
    try {
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text('Gestion des Congés - Rapport', 20, 20);

      // Company Info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Système de Gestion RH', 20, 30);
      doc.text(`Rapport généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);

      // Report Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(report.titre, 20, 50);

      // Report Metadata Table
      const metadata = [
        ['Type de rapport', getReportTypeLabel(report.type)],
        ['Date de génération', formatDate(report.date_generation)],
        ['Généré par', `${report.user?.nom || ''} ${report.user?.prenom || ''}`]
      ];

      autoTable(doc, {
        startY: 60,
        head: [['Information', 'Valeur']],
        body: metadata,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 }
      });

      // Content Section
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Contenu du Rapport:', 20, finalY);

      const content = typeof report.contenu === 'string' ? report.contenu : JSON.stringify(report.contenu, null, 2);
      const lines = doc.splitTextToSize(content, 170);

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(lines, 20, finalY + 10);

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text('© Système de Gestion des Congés', 20, doc.internal.pageSize.height - 10);
      }

      doc.save(`${report.titre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Erreur lors du téléchargement du PDF');
    }
  };

  const handleDownloadExcel = async (report) => {
    try {
      const wb = XLSX.utils.book_new();

      // Main report sheet
      const reportData = [
        ['RAPPORT - GESTION DES CONGES'],
        [''],
        ['Informations générales'],
        ['Titre du rapport', report.titre],
        ['Type de rapport', getReportTypeLabel(report.type)],
        ['Date de génération', formatDate(report.date_generation)],
        ['Généré par', `${report.user?.nom || ''} ${report.user?.prenom || ''}`],
        [''],
        ['Contenu du rapport'],
        [typeof report.contenu === 'string' ? report.contenu : JSON.stringify(report.contenu, null, 2)]
      ];

      const ws = XLSX.utils.aoa_to_sheet(reportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Column A
        { wch: 50 }  // Column B
      ];

      // Style the header row
      if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 16 }, fill: { fgColor: { rgb: '2980B9' } } };

      // Style section headers
      if (ws['A3']) ws['A3'].s = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: 'ECF0F1' } } };
      if (ws['A9']) ws['A9'].s = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: 'ECF0F1' } } };

      XLSX.utils.book_append_sheet(wb, ws, 'Rapport');

      // If report content is JSON with structured data, create additional sheets
      if (typeof report.contenu === 'object' && report.contenu !== null) {
        if (report.contenu.stats && report.contenu.demandes) {
          // Statistics sheet
          const statsData = [
            ['STATISTIQUES GENERALES'],
            [''],
            ['Métrique', 'Valeur'],
            ['Total des demandes', report.contenu.stats.total || 0],
            ['Demandes approuvées', report.contenu.stats.approved || 0],
            ['Demandes refusées', report.contenu.stats.refused || 0],
            ['Demandes en attente', report.contenu.stats.pending || 0],
            ['Total jours demandés', report.contenu.stats.totalDays || 0],
            ['Taux d\'approbation', report.contenu.stats.total > 0 ? `${Math.round((report.contenu.stats.approved / report.contenu.stats.total) * 100)}%` : '0%']
          ];

          const statsWs = XLSX.utils.aoa_to_sheet(statsData);
          statsWs['!cols'] = [
            { wch: 25 },
            { wch: 15 }
          ];

          // Style header
          if (statsWs['A1']) statsWs['A1'].s = { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: '2980B9' } } };
          if (statsWs['A3']) statsWs['A3'].s = { font: { bold: true }, fill: { fgColor: { rgb: 'BDC3C7' } } };

          XLSX.utils.book_append_sheet(wb, statsWs, 'Statistiques');

          // Detailed demandes sheet
          if (report.contenu.demandes && Array.isArray(report.contenu.demandes)) {
            const demandesData = report.contenu.demandes.map(d => ({
              'Matricule': d.employe?.matricule || '',
              'Nom': d.employe?.nom || '',
              'Prénom': d.employe?.prenom || '',
              'Type': getReportTypeLabel(d.typeDemande),
              'Date début': d.dateDebut ? new Date(d.dateDebut).toLocaleDateString('fr-FR') : '',
              'Date fin': d.dateFin ? new Date(d.dateFin).toLocaleDateString('fr-FR') : '',
              'Durée (jours)': d.nombreJours || 0,
              'Statut': getReportTypeLabel(d.statut),
              'Date demande': d.dateCreation ? new Date(d.dateCreation).toLocaleDateString('fr-FR') : '',
              'Date validation': d.updated_at ? new Date(d.updated_at).toLocaleDateString('fr-FR') : '',
              'Motif': d.motif || ''
            }));

            const demandesWs = XLSX.utils.json_to_sheet(demandesData);
            demandesWs['!cols'] = [
              { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
              { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
              { wch: 12 }, { wch: 12 }, { wch: 30 }
            ];

            XLSX.utils.book_append_sheet(wb, demandesWs, 'Demandes Détaillées');
          }
        }
      }

      XLSX.writeFile(wb, `${report.titre.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setError('Erreur lors du téléchargement du Excel');
    }
  };

  const handleDownloadTxt = (report) => {
    handleDownloadReport(report);
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await deleteRapport(report.id);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        setError('Erreur lors de la suppression du rapport');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'monthly': return 'Mensuel';
      case 'quarterly': return 'Trimestriel';
      case 'annual': return 'Annuel';
      case 'demandes_export': return 'Export Demandes';
      case 'pdf': return 'PDF';
      case 'excel': return 'Excel';
      default: return type;
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'monthly': return 'primary';
      case 'quarterly': return 'secondary';
      case 'annual': return 'success';
      case 'demandes_export': return 'info';
      case 'pdf': return 'error';
      case 'excel': return 'success';
      default: return 'default';
    }
  };

  /* ===================== EXPORT FUNCTIONS ===================== */
  const fetchDemandesForExport = async () => {
    try {
      const response = await getDemandes();
      setDemandes(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching demandes:', err);
      setError('Erreur lors du chargement des demandes');
      return [];
    }
  };

  const generatePDF = async () => {
    try {
      let demandesData = await fetchDemandesForExport();

      // Apply filters
      demandesData = demandesData.filter(demande => {
        const demandeDate = new Date(demande.dateCreation);
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

        if (dateFrom && demandeDate < dateFrom) return false;
        if (dateTo && demandeDate > dateTo) return false;
        if (filters.status && demande.statut !== filters.status) return false;
        if (filters.type && demande.typeDemande !== filters.type) return false;
        if (filters.department && demande.employe?.departement !== filters.department) return false;

        return true;
      });

      const doc = new jsPDF();

      // Title with logo
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text('Rapport RH - Gestion des Absences', 20, 20);

      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);

      // Statistics section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Synthèse des Statistiques', 20, 45);

      const total = demandesData.length;
      const approved = demandesData.filter(d => d.statut === 'approuvee').length;
      const refused = demandesData.filter(d => d.statut === 'refusee').length;
      const pending = demandesData.filter(d => d.statut === 'en_attente').length;
      const totalDays = demandesData.reduce((sum, d) => sum + (d.nombreJours || 0), 0);

      // Statistics table
      autoTable(doc, {
        startY: 50,
        head: [['Statistique', 'Valeur']],
        body: [
          ['Total des demandes', total],
          ['Demandes approuvées', approved],
          ['Demandes refusées', refused],
          ['Demandes en attente', pending],
          ['Total jours demandés', totalDays],
          ['Taux d\'approbation', total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%']
        ],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Detailed table
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Détail des Demandes', 20, finalY);

      const tableData = demandesData.map(d => [
        `${d.employe?.nom || ''} ${d.employe?.prenom || ''}`,
        getReportTypeLabel(d.typeDemande),
        new Date(d.dateDebut).toLocaleDateString('fr-FR'),
        new Date(d.dateFin).toLocaleDateString('fr-FR'),
        d.nombreJours || 0,
        getReportTypeLabel(d.statut),
        new Date(d.updated_at || d.dateCreation).toLocaleDateString('fr-FR')
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Employé', 'Type', 'Début', 'Fin', 'Jours', 'Statut', 'Validation']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [52, 73, 94] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 10 }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }

      const fileName = `rapport_absences_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      // Save to database
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const rapportData = {
        titre: 'Rapport RH - Gestion des Absences (PDF)',
        contenu: JSON.stringify({
          stats: { total, approved, refused, pending, totalDays },
          demandes: demandesData,
          generatedAt: new Date().toISOString()
        }),
        type: 'pdf',
        date_generation: new Date().toISOString().split('T')[0],
        user_id: user.id
      };
      await createRapport(rapportData);

      setExportDialog(false);
      fetchReports();

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Erreur lors de la génération du PDF');
    }
  };

  const generateExcel = async () => {
    try {
      let demandesData = await fetchDemandesForExport();

      // Apply filters
      demandesData = demandesData.filter(demande => {
        const demandeDate = new Date(demande.dateCreation);
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

        if (dateFrom && demandeDate < dateFrom) return false;
        if (dateTo && demandeDate > dateTo) return false;
        if (filters.status && demande.statut !== filters.status) return false;
        if (filters.type && demande.typeDemande !== filters.type) return false;
        if (filters.department && demande.employe?.departement !== filters.department) return false;

        return true;
      });

      const wb = XLSX.utils.book_new();

      // Main data sheet
      const excelData = demandesData.map(d => ({
        'Matricule': d.employe?.matricule || '',
        'Nom': d.employe?.nom || '',
        'Prénom': d.employe?.prenom || '',
        'Type': getReportTypeLabel(d.typeDemande),
        'Date début': new Date(d.dateDebut).toLocaleDateString('fr-FR'),
        'Date fin': new Date(d.dateFin).toLocaleDateString('fr-FR'),
        'Durée (jours)': d.nombreJours || 0,
        'Statut': getReportTypeLabel(d.statut),
        'Date demande': new Date(d.dateCreation).toLocaleDateString('fr-FR'),
        'Date validation': d.updated_at ? new Date(d.updated_at).toLocaleDateString('fr-FR') : '',
        'Motif': d.motif || ''
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 30 }
      ];

      // Statistics sheet
      const total = demandesData.length;
      const approved = demandesData.filter(d => d.statut === 'approuvee').length;
      const refused = demandesData.filter(d => d.statut === 'refusee').length;
      const pending = demandesData.filter(d => d.statut === 'en_attente').length;
      const totalDays = demandesData.reduce((sum, d) => sum + (d.nombreJours || 0), 0);

      const statsSheet = XLSX.utils.json_to_sheet([
        ['Statistiques Générales', ''],
        ['Total demandes', total],
        ['Demandes approuvées', approved],
        ['Demandes refusées', refused],
        ['Demandes en attente', pending],
        ['Total jours', totalDays],
        ['Taux approbation', total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%']
      ]);

      XLSX.utils.book_append_sheet(wb, ws, 'Demandes');
      XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistiques');

      const fileName = `rapport_absences_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // Save to database
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const rapportData = {
        titre: 'Rapport RH - Gestion des Absences (Excel)',
        contenu: JSON.stringify({
          stats: { total, approved, refused, pending, totalDays },
          demandes: demandesData,
          generatedAt: new Date().toISOString()
        }),
        type: 'excel',
        date_generation: new Date().toISOString().split('T')[0],
        user_id: user.id
      };
      await createRapport(rapportData);

      setExportDialog(false);
      fetchReports();

    } catch (error) {
      console.error('Error generating Excel:', error);
      setError('Erreur lors de la génération du Excel');
    }
  };

  const generateTXT = async () => {
    try {
      let demandesData = await fetchDemandesForExport();

      // Apply filters
      demandesData = demandesData.filter(demande => {
        const demandeDate = new Date(demande.dateCreation);
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

        if (dateFrom && demandeDate < dateFrom) return false;
        if (dateTo && demandeDate > dateTo) return false;
        if (filters.status && demande.statut !== filters.status) return false;
        if (filters.type && demande.typeDemande !== filters.type) return false;
        if (filters.department && demande.employe?.departement !== filters.department) return false;

        return true;
      });

      const total = demandesData.length;
      const approved = demandesData.filter(d => d.statut === 'approuvee').length;
      const refused = demandesData.filter(d => d.statut === 'refusee').length;
      const pending = demandesData.filter(d => d.statut === 'en_attente').length;
      const totalDays = demandesData.reduce((sum, d) => sum + (d.nombreJours || 0), 0);

      let content = `RAPPORT RH - GESTION DES ABSENCES\n`;
      content += `================================\n\n`;
      content += `Généré le: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

      content += `SYNTHESE DES STATISTIQUES\n`;
      content += `========================\n`;
      content += `Total des demandes: ${total}\n`;
      content += `Demandes approuvées: ${approved}\n`;
      content += `Demandes refusées: ${refused}\n`;
      content += `Demandes en attente: ${pending}\n`;
      content += `Total jours demandés: ${totalDays}\n`;
      content += `Taux d'approbation: ${total > 0 ? Math.round((approved / total) * 100) : 0}%\n\n`;

      content += `DETAIL DES DEMANDES\n`;
      content += `===================\n\n`;

      demandesData.forEach((demande, index) => {
        content += `${index + 1}. ${demande.employe?.nom || ''} ${demande.employe?.prenom || ''}\n`;
        content += `   Matricule: ${demande.employe?.matricule || ''}\n`;
        content += `   Type: ${getReportTypeLabel(demande.typeDemande)}\n`;
        content += `   Période: ${new Date(demande.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(demande.dateFin).toLocaleDateString('fr-FR')}\n`;
        content += `   Durée: ${demande.nombreJours || 0} jours\n`;
        content += `   Statut: ${getReportTypeLabel(demande.statut)}\n`;
        content += `   Date demande: ${new Date(demande.dateCreation).toLocaleDateString('fr-FR')}\n`;
        if (demande.updated_at) {
          content += `   Date validation: ${new Date(demande.updated_at).toLocaleDateString('fr-FR')}\n`;
        }
        if (demande.motif) {
          content += `   Motif: ${demande.motif}\n`;
        }
        content += `\n`;
      });

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_absences_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Save to database
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const rapportData = {
        titre: 'Rapport RH - Gestion des Absences (TXT)',
        contenu: content,
        type: 'txt',
        date_generation: new Date().toISOString().split('T')[0],
        user_id: user.id
      };
      await createRapport(rapportData);

      setExportDialog(false);
      fetchReports();

    } catch (error) {
      console.error('Error generating TXT:', error);
      setError('Erreur lors de la génération du TXT');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography color="text.secondary">Chargement des rapports...</Typography>
          </Stack>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              📊 Gestion des Rapports
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Historique et génération de rapports
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setExportDialog(true)}
              sx={{
                borderRadius: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleGenerateReport}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                }
              }}
            >
              Générer Rapport
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchReports}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Reports Filters */}
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              🔍 Filtres des rapports
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type de rapport</InputLabel>
                  <Select
                    value={reportFilters.type}
                    onChange={(e) => setReportFilters({ ...reportFilters, type: e.target.value })}
                    label="Type de rapport"
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="monthly">Mensuel</MenuItem>
                    <MenuItem value="quarterly">Trimestriel</MenuItem>
                    <MenuItem value="annual">Annuel</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="txt">TXT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  value={reportFilters.dateFrom}
                  onChange={(e) => setReportFilters({ ...reportFilters, dateFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={reportFilters.dateTo}
                  onChange={(e) => setReportFilters({ ...reportFilters, dateTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Utilisateur"
                  value={reportFilters.user}
                  onChange={(e) => setReportFilters({ ...reportFilters, user: e.target.value })}
                  placeholder="Nom ou prénom..."
                  size="small"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={() => setReportFilters({
                  type: '',
                  dateFrom: '',
                  dateTo: '',
                  user: ''
                })}
                sx={{ borderRadius: 2 }}
              >
                Réinitialiser
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], mb: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon color="primary" />
                <Typography variant="h5" fontWeight={600}>
                  Liste des Rapports
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}
                </Typography>
                <Tooltip title="Actualiser">
                  <IconButton onClick={fetchReports} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <TableContainer sx={{ maxHeight: 500, borderRadius: 2 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Titre</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Date de génération</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Utilisateur</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <AssessmentIcon sx={{ fontSize: 60, color: theme.palette.grey[300], mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Aucun rapport trouvé
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Les rapports générés apparaîtront ici
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReports.map((report) => (
                      <TableRow
                        key={report.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: alpha(theme.palette.primary.light, 0.05) },
                          cursor: 'pointer'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {report.titre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getReportTypeLabel(report.type)}
                            size="small"
                            color={getReportTypeColor(report.type)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDate(report.date_generation)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {report.user?.nom} {report.user?.prenom}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Voir le rapport">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewReport(report);
                                }}
                                sx={{
                                  color: theme.palette.info.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger PDF">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf(report);
                                }}
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                }}
                              >
                                <PdfIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger Excel">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadExcel(report);
                                }}
                                sx={{
                                  color: theme.palette.success.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
                                }}
                              >
                                <ExcelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger TXT">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadTxt(report);
                                }}
                                sx={{
                                  color: theme.palette.info.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                                }}
                              >
                                <TxtIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(report);
                                }}
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredReports.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📈 Statistiques Congés
                </Typography>
                <LeaveChart />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  👥 Top Absents
                </Typography>
                <TopAbsent />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* View Report Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={() => setViewDialog({ open: false, report: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: theme.shadows[12]
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1
          }}>
            <DescriptionIcon />
            {viewDialog.report?.titre}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {viewDialog.report && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                    <Chip
                      label={getReportTypeLabel(viewDialog.report.type)}
                      size="small"
                      color={getReportTypeColor(viewDialog.report.type)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Date de génération:</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {formatDate(viewDialog.report.date_generation)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Généré par:</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {viewDialog.report.user?.nom} {viewDialog.report.user?.prenom}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Contenu du rapport:
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.grey[50], 0.5),
                    p: 2,
                    borderRadius: 1,
                    maxHeight: 400,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {typeof viewDialog.report.contenu === 'string'
                    ? viewDialog.report.contenu
                    : JSON.stringify(viewDialog.report.contenu, null, 2)
                  }
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => handleDownloadReport(viewDialog.report)}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Télécharger
            </Button>
            <Button
              onClick={() => setViewDialog({ open: false, report: null })}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog
          open={exportDialog}
          onClose={() => setExportDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: theme.shadows[12]
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1
          }}>
            <DownloadIcon />
            Exporter les données
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              Choisissez le format d'export pour les demandes de congé :
            </Typography>



            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={generatePDF}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderColor: theme.palette.error.dark,
                    bgcolor: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Export PDF
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rapport complet avec tableaux et statistiques
                  </Typography>
                </Box>
              </Button>

              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                onClick={generateExcel}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  '&:hover': {
                    borderColor: theme.palette.success.dark,
                    bgcolor: alpha(theme.palette.success.main, 0.1)
                  }
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Export Excel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Feuille de calcul avec données détaillées
                  </Typography>
                </Box>
              </Button>

              <Button
                variant="outlined"
                startIcon={<TxtIcon />}
                onClick={generateTXT}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  borderColor: theme.palette.info.main,
                  color: theme.palette.info.main,
                  '&:hover': {
                    borderColor: theme.palette.info.dark,
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Export TXT
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fichier texte formaté avec toutes les informations
                  </Typography>
                </Box>
              </Button>
            </Stack>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Les rapports générés seront automatiquement sauvegardés dans l'historique des rapports.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setExportDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Annuler
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageWrapper>
  );
};

export default Reports;
