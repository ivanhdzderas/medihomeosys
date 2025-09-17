import React, { useState } from 'react';
import { TextField, Button, Box, IconButton, Tab, Tabs } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

const NonPathologicalHistoryForm = ({ onNext, onSave, patientData }) => {
  // Inicializa el estado con los datos del paciente o con un array vacío
  const [nonPathologicalHistory, setNonPathologicalHistory] = useState(
    patientData.nonPathologicalHistory && patientData.nonPathologicalHistory.length > 0 
      ? patientData.nonPathologicalHistory 
      : [{ habitos: '', actividades_fisicas: '', dieta: '' }]
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newNonPathologicalHistory = [...nonPathologicalHistory];
    newNonPathologicalHistory[index][name] = value;
    setNonPathologicalHistory(newNonPathologicalHistory);
  };

  const handleAdd = () => {
    setNonPathologicalHistory([...nonPathologicalHistory, { habitos: '', actividades_fisicas: '', dieta: '' }]);
    setSelectedTab(nonPathologicalHistory.length); // Cambiar a la nueva pestaña
  };

  const handleRemove = (index) => {
    const newNonPathologicalHistory = [...nonPathologicalHistory];
    newNonPathologicalHistory.splice(index, 1);
    setNonPathologicalHistory(newNonPathologicalHistory);
    setSelectedTab(Math.max(0, selectedTab - 1)); // Ajustar la pestaña seleccionada
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(nonPathologicalHistory);
 
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
        {nonPathologicalHistory.map((_, index) => (
          <Tab key={index} label={`Historial ${index + 1}`} />
        ))}
      </Tabs>
      {nonPathologicalHistory.map((entry, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={selectedTab !== index}
          sx={{ display: selectedTab === index ? 'block' : 'none', mt: 2 }}
        >
          <TextField
            label="Hábitos"
            name="habitos"
            value={entry.habitos}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Actividades Físicas"
            name="actividades_fisicas"
            value={entry.actividades_fisicas}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Dieta"
            name="dieta"
            value={entry.dieta}
            onChange={(e) => handleChange(index, e)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <IconButton onClick={() => handleRemove(index)} disabled={nonPathologicalHistory.length === 1}>
              <RemoveCircleOutline />
            </IconButton>
            <IconButton onClick={handleAdd}>
              <AddCircleOutline />
            </IconButton>
          </Box>
        </Box>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          Siguiente
        </Button>
      </Box>
    </Box>
  );
};

export default NonPathologicalHistoryForm;