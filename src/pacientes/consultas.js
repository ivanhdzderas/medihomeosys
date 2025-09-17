import React, { useState, useEffect } from 'react';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot 
} from '@mui/lab';
import axios from '../axiosConfig'; // ✅ Cambia esta importación
import Moment from 'react-moment';
import { 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Link, 
  CircularProgress, 
  Alert, 
  Container, 
  Paper, 
  Box,
  Snackbar
} from '@mui/material';
import NiimbluePrintDialog from './NiimbluePrintDialog';

const ConsultationsTimeline = ({ patientId, nueva_consulta, seguimiento }) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    axios.get(`/api/consultas/${patientId}`) // ✅ Cambia aquí
      .then(response => {
        setConsultations(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar las consultas:', error);
        setError('Error al cargar las consultas');
        setLoading(false);
      });
  }, [patientId]);

  const handleGeneratePDF = async (consultaId) => {
    try {
      setGeneratingPDF(true);
      
      // Hacer la petición para generar el PDF
      const response = await axios.get(
        `/api/consultas/${consultaId}/pdf`, // ✅ Cambia aquí
        { responseType: 'blob' }
      );

      // Crear el objeto URL para el blob
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Abrir el PDF en una nueva pestaña
      window.open(pdfUrl, '_blank');

      // Limpiar el objeto URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 100);

      setGeneratingPDF(false);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setError('Error al generar el PDF');
      setGeneratingPDF(false);
    }
  };

  const handlePrintLabels = async (consultaId) => {
    try {
      setPrintLoading(true);
      
      // Obtener los datos de medicamentos para la consulta
      const response = await axios.get(
        `/api/consulta/${consultaId}/medicamentos` // ✅ Cambia aquí
      );
      
      setPrintData(response.data);
      setPrintDialogOpen(true);
      setPrintLoading(false);
    } catch (error) {
      console.error('Error al cargar datos para impresión:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar datos para impresión',
        severity: 'error'
      });
      setPrintLoading(false);
    }
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setPrintData(null);
  };

  const handlePrintSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Etiquetas impresas correctamente',
      severity: 'success'
    });
  };

  const handlePrintError = (error) => {
    setSnackbar({
      open: true,
      message: `Error al imprimir: ${error.message}`,
      severity: 'error'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Consultas
      </Typography>
      <Paper elevation={3}>
        <Box p={2}>
          <Timeline position="alternate">
            {consultations.map((consulta) => (
              <TimelineItem key={consulta.id}>
                <TimelineSeparator>
                  <TimelineDot />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Box mb={2}>
                    <Typography variant="h6">
                      <Moment format="YYYY/MM/DD">{consulta.fecha}</Moment>
                    </Typography>
                    <Typography variant="body1">{consulta.diagnostico}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => seguimiento(consulta.id)}
                    >
                      + dar seguimiento
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleGeneratePDF(consulta.id)}
                      disabled={generatingPDF}
                      startIcon={generatingPDF ? <CircularProgress size={20} /> : null}
                    >
                      {generatingPDF ? 'Generando...' : 'Ver PDF'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handlePrintLabels(consulta.id)}
                      disabled={printLoading}
                      startIcon={printLoading ? <CircularProgress size={20} /> : null}
                    >
                      {printLoading ? 'Cargando...' : 'Imprimir Etiquetas'}
                    </Button>
                  </Box>
                  <List>
                    {consulta.archivos.map((archivo, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={
                            <Link 
                              href={`/${archivo}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {archivo}
                            </Link>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </TimelineContent>
              </TimelineItem>
            ))}
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={nueva_consulta}
                >
                  + Nueva consulta
                </Button>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Box>
      </Paper>

      {/* Diálogo de impresión */}
      <NiimbluePrintDialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        printData={printData}
        onPrintSuccess={handlePrintSuccess}
        onPrintError={handlePrintError}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConsultationsTimeline;