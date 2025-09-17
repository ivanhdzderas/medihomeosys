import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, IconButton, Tab, Tabs } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

const FamilyHistoryForm = ({ onNext, onSave, patientData }) => {
  // Inicializa el estado con los datos del paciente o con un array vacío
  const [familyHistory, setFamilyHistory] = useState(
    patientData.familyHistory && patientData.familyHistory.length > 0
      ? patientData.familyHistory
      : [{ relacion: '', condicion: '' }]
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newFamilyHistory = [...familyHistory];
    newFamilyHistory[index][name] = value;
    setFamilyHistory(newFamilyHistory);
  };

  const handleAdd = () => {
    setFamilyHistory([...familyHistory, { relacion: '', condicion: '' }]);
    setSelectedTab(familyHistory.length); // Cambiar a la nueva pestaña
  };

  const handleRemove = (index) => {
    const newFamilyHistory = [...familyHistory];
    newFamilyHistory.splice(index, 1);
    setFamilyHistory(newFamilyHistory);
    setSelectedTab(Math.max(0, selectedTab - 1)); // Ajustar la pestaña seleccionada
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(familyHistory);
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
        {familyHistory.map((_, index) => (
          <Tab key={index} label={`Familiar ${index + 1}`} />
        ))}
      </Tabs>
      {familyHistory.map((entry, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={selectedTab !== index}
          sx={{ display: selectedTab === index ? 'block' : 'none', mt: 2 }}
        >
          <TextField
            label="Relación"
            name="relacion"
            value={entry.relacion}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Condición"
            name="condicion"
            value={entry.condicion}
            onChange={(e) => handleChange(index, e)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <IconButton onClick={() => handleRemove(index)} disabled={familyHistory.length === 1}>
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

export default FamilyHistoryForm;