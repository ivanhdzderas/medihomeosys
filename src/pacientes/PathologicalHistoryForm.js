import React, { useState } from 'react';
import { TextField, Button, Box, IconButton, Tab, Tabs } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

const PathologicalHistoryForm = ({ onNext, onSave, patientData }) => {
  // Inicializa el estado con los datos del paciente o con un array vacío
  const [pathologicalHistory, setPathologicalHistory] = useState(
    patientData.pathologicalHistory && patientData.pathologicalHistory.length > 0
      ? patientData.pathologicalHistory
      : [{ condicion: '', fecha_diagnostico: '', tratamiento: '', observaciones: '' }]
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newPathologicalHistory = [...pathologicalHistory];
    newPathologicalHistory[index][name] = value;
    setPathologicalHistory(newPathologicalHistory);
  };

  const handleAdd = () => {
    setPathologicalHistory([...pathologicalHistory, { condicion: '', fecha_diagnostico: '', tratamiento: '', observaciones: '' }]);
    setSelectedTab(pathologicalHistory.length); // Cambiar a la nueva pestaña
  };

  const handleRemove = (index) => {
    const newPathologicalHistory = [...pathologicalHistory];
    newPathologicalHistory.splice(index, 1);
    setPathologicalHistory(newPathologicalHistory);
    setSelectedTab(Math.max(0, selectedTab - 1)); // Ajustar la pestaña seleccionada
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(pathologicalHistory);

  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        {pathologicalHistory.map((_, index) => (
          <Tab key={index} label={`Condición ${index + 1}`} />
        ))}
      </Tabs>
      {pathologicalHistory.map((entry, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={selectedTab !== index}
          sx={{ display: selectedTab === index ? 'block' : 'none', mt: 2 }}
        >
          <TextField
            label="Condición"
            name="condicion"
            value={entry.condicion}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Fecha de Diagnóstico Inicial"
            name="fecha_diagnostico"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={entry.fecha_diagnostico}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Tratamiento"
            name="tratamiento"
            value={entry.tratamiento}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Observaciones"
            name="observaciones"
            multiline
            rows={3}
            fullWidth
            value={entry.observaciones}
            onChange={(e) => handleChange(index, e)}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <IconButton onClick={() => handleRemove(index)} disabled={pathologicalHistory.length === 1}>
              <RemoveCircleOutline />
            </IconButton>
            <IconButton onClick={handleAdd}>
              <AddCircleOutline />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PathologicalHistoryForm;