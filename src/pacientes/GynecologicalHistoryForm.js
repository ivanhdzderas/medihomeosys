import React, { useState } from 'react';
import { TextField, Button, Box, IconButton, Tab, Tabs } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

const GynecologicalHistoryForm = ({ onNext, onSave, patientData }) => {
  // Inicializa el estado con los datos del paciente o con un array vacío
  const [gynecologicalHistory, setGynecologicalHistory] = useState(
    patientData.gynecologicalHistory && patientData.gynecologicalHistory.length > 0
      ? patientData.gynecologicalHistory
      : [{ menarca: '', ciclos_menstruales: '', embarazos: '', partos: '', abortos: '', antecedentes_familiares_ginecologicos: '' }]
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newGynecologicalHistory = [...gynecologicalHistory];
    newGynecologicalHistory[index][name] = value;
    setGynecologicalHistory(newGynecologicalHistory);
  };

  const handleAdd = () => {
    setGynecologicalHistory([...gynecologicalHistory, { menarca: '', ciclos_menstruales: '', embarazos: '', partos: '', abortos: '', antecedentes_familiares_ginecologicos: '' }]);
    setSelectedTab(gynecologicalHistory.length); // Cambiar a la nueva pestaña
  };

  const handleRemove = (index) => {
    const newGynecologicalHistory = [...gynecologicalHistory];
    newGynecologicalHistory.splice(index, 1);
    setGynecologicalHistory(newGynecologicalHistory);
    setSelectedTab(Math.max(0, selectedTab - 1)); // Ajustar la pestaña seleccionada
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(gynecologicalHistory);
    // Este es el último formulario, por lo que llamamos a onNext() para finalizar el stepper
    onNext();
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
        {gynecologicalHistory.map((_, index) => (
          <Tab key={index} label={`Historial ${index + 1}`} />
        ))}
      </Tabs>
      {gynecologicalHistory.map((entry, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={selectedTab !== index}
          sx={{ display: selectedTab === index ? 'block' : 'none', mt: 2 }}
        >
          <TextField
            label="Menarca"
            name="menarca"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={entry.menarca}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Ciclos Menstruales"
            name="ciclos_menstruales"
            value={entry.ciclos_menstruales}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Embarazos"
            name="embarazos"
            type="number"
            value={entry.embarazos}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Partos"
            name="partos"
            type="number"
            value={entry.partos}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Abortos"
            name="abortos"
            type="number"
            value={entry.abortos}
            onChange={(e) => handleChange(index, e)}
          />
          <TextField
            label="Antecedentes Familiares Ginecológicos"
            name="antecedentes_familiares_ginecologicos"
            multiline
            rows={3}
            fullWidth
            value={entry.antecedentes_familiares_ginecologicos}
            onChange={(e) => handleChange(index, e)}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <IconButton onClick={() => handleRemove(index)} disabled={gynecologicalHistory.length === 1}>
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
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default GynecologicalHistoryForm;