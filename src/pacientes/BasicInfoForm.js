import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const BasicInfoForm = ({ onNext, onSave, patientData }) => {
  const [formData, setFormData] = useState(patientData.basicInfo || {
    nombre: '',
    fecha_nacimiento: '',
    calle: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    pais: '',
    telefono: '',
    email: '',
    sexo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  // Agregamos un useEffect para que la información guardada se refleje en el estado local
  useEffect(() => {
    if (patientData.basicInfo) {
      setFormData(patientData.basicInfo);
    }
  }, [patientData.basicInfo]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
      <TextField
        required
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
      />
      <TextField
        required
        label="Fecha de Nacimiento"
        name="fecha_nacimiento"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.fecha_nacimiento}
        onChange={handleChange}
      />
      <TextField
        label="Calle"
        name="calle"
        value={formData.calle}
        onChange={handleChange}
      />
      <TextField
        label="Ciudad"
        name="ciudad"
        value={formData.ciudad}
        onChange={handleChange}
      />
      <TextField
        label="Estado"
        name="estado"
        value={formData.estado}
        onChange={handleChange}
      />
      <TextField
        label="Código Postal"
        name="codigo_postal"
        value={formData.codigo_postal}
        onChange={handleChange}
      />
      <TextField
        label="País"
        name="pais"
        value={formData.pais}
        onChange={handleChange}
      />
      <TextField
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <FormControl required>
        <InputLabel id="sexo-select-label">Sexo</InputLabel>
        <Select
          labelId="sexo-select-label"
          id="sexo-select"
          name="sexo"
          value={formData.sexo}
          label="Sexo"
          onChange={handleChange}
        >
          <MenuItem value={"Hombre"}>Hombre</MenuItem>
          <MenuItem value={"Mujer"}>Mujer</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          Siguiente
        </Button>
      </Box>
    </Box>
  );
};

export default BasicInfoForm;