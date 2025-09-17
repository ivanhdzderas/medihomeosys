import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  TextField, 
  TextareaAutosize, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import config from '../confi';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function NewConsultation({ idpaciente, onConsultaAdded, anterior }) {
  const [value, setValue] = useState(0);
  const [diagnostico, setDiagnostico] = useState('');
  const [fecha, setFecha] = useState('');
  const [tratamientos, setTratamientos] = useState([]);
  const [archivos, setArchivos] = useState([]);

  // Función para manejar la selección de archivos
  const onDrop = (acceptedFiles) => {
    // Concatenar los nuevos archivos con los archivos existentes
    setArchivos((prevArchivos) => [...prevArchivos, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddTratamiento = () => {
    setTratamientos([...tratamientos, { medicamento: '', dosis: '', duracion: '', observaciones: '' }]);
  };

  const handleRemoveTratamiento = (index) => {
    const updatedTratamientos = tratamientos.filter((_, i) => i !== index);
    setTratamientos(updatedTratamientos);
  };

  const handleChangeTratamiento = (index, field, value) => {
    const updatedTratamientos = tratamientos.map((tratamiento, i) => 
      i === index ? { ...tratamiento, [field]: value } : tratamiento
    );
    setTratamientos(updatedTratamientos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que la fecha no esté vacía
    if (!fecha) {
      console.error('La fecha no puede estar vacía.');
      alert('Por favor, selecciona una fecha válida.');
      return;
    }

    // Crear un objeto FormData
    const formData = new FormData();

    // Agregar los datos de la consulta
    formData.append('id_paciente', idpaciente);
    formData.append('diagnostico', diagnostico);
    formData.append('fecha', fecha); // Asegúrate de que este valor no sea null
    formData.append('id_consulta_anterior', anterior);
    formData.append('tratamientos', JSON.stringify(tratamientos));

    // Agregar los archivos
    archivos.forEach((archivo) => {
      formData.append('archivos[]', archivo); // Usa 'archivos[]' para enviar un array de archivos
    });

    try {
      // Enviar la solicitud POST con FormData
      await axios.post(`${config.API_BASE_URL}/consultas`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Especifica el tipo de contenido
        },
      });
      onConsultaAdded();
    } catch (error) {
      console.error('Error al guardar la consulta y tratamientos:', error);
    }
  };

  useEffect(() => {
    // Establecer una fecha predeterminada en formato YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    setFecha(currentDate);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static">
        <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="basic tabs example"
            variant="fullWidth" // Opcional, para que las pestañas ocupen todo el ancho
            indicatorColor="secondary" // El color del indicador
            textColor="inherit" // El color del texto
          >
          <Tab label="Consulta" {...a11yProps(0)} />
          <Tab label="Tratamientos" {...a11yProps(1)} />
          <Tab label="Archivos" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {/* Formulario para la consulta */}
        <form onSubmit={handleSubmit}>
          <TextareaAutosize
            minRows={5}
            placeholder="Diagnóstico"
            style={{ width: '100%', margin: '16px 0' }}
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
          />
          <TextField
            label="Fecha"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            margin="normal"
            fullWidth
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit">
            Guardar Consulta y Tratamientos
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* Tabla para tratamientos */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medicamento</TableCell>
              <TableCell>Dosis</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tratamientos.map((tratamiento, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    value={tratamiento.medicamento}
                    onChange={(e) => handleChangeTratamiento(index, 'medicamento', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={tratamiento.dosis}
                    onChange={(e) => handleChangeTratamiento(index, 'dosis', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={tratamiento.duracion}
                    onChange={(e) => handleChangeTratamiento(index, 'duracion', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </TableCell>
                <TableCell>
                  <TextareaAutosize
                    minRows={3}
                    value={tratamiento.observaciones}
                    onChange={(e) => handleChangeTratamiento(index, 'observaciones', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemoveTratamiento(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="contained" color="primary" onClick={handleAddTratamiento}>
          Agregar Tratamiento
        </Button>
      </TabPanel>
      <TabPanel value={value} index={2}>
        {/* Área de arrastre de archivos */}
        <div {...getRootProps()} style={{ border: '2px dashed #aaa', padding: '20px', marginTop: '16px' }}>
          <input {...getInputProps()} />
          <Typography>Añadir archivos arrastrándolos o haz clic para seleccionarlos</Typography>
        </div>
        <ul>
          {archivos.map((file, index) => (
            <li key={index}>{file.path}</li>
          ))}
        </ul>
      </TabPanel>
    </Box>
  );
}