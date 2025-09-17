import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '../confi';

const EditPatientForm = ({ paciente, onEditCompleted }) => {
  const [nombre, setNombre] = useState(paciente.nombre || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente.fecha_nacimiento || '');
  const [telefono, setTelefono] = useState(paciente.telefono || '');
  const [email, setEmail] = useState(paciente.email || '');
  const [calle, setCalle] = useState(paciente.calle || '');
  const [ciudad, setCiudad] = useState(paciente.ciudad || '');
  const [estado, setEstado] = useState(paciente.estado || '');
  const [codigoPostal, setCodigoPostal] = useState(paciente.codigo_postal || '');
  const [pais, setPais] = useState(paciente.pais || '');


  const handleSave = () => {
    axios.put(`${config.API_BASE_URL}/pacientes/${paciente.id}`, {
      nombre,
      fecha_nacimiento: fechaNacimiento,
      direccion: '', // Mantener direccion como un string vacío
      telefono,
      email,
      calle,
      ciudad,
      estado,
      codigo_postal: codigoPostal,
      pais
    })
    .then(() => {
      Swal.fire('¡Actualizado!', 'El paciente ha sido actualizado.', 'success');
      onEditCompleted();
    })
    .catch(error => {
      Swal.fire('Error!', 'Hubo un problema al actualizar el paciente.', 'error');
    });
  };

  return (
    <Box component="form">
      <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth margin="normal" />
      <TextField label="Fecha de Nacimiento" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} fullWidth margin="normal" />
      <TextField label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} fullWidth margin="normal" />
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
      <TextField label="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} fullWidth margin="normal" />
      <TextField label="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} fullWidth margin="normal" />
      <TextField label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} fullWidth margin="normal" />
      <TextField label="Código Postal" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} fullWidth margin="normal" />
      <TextField label="País" value={pais} onChange={(e) => setPais(e.target.value)} fullWidth margin="normal" />
      <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
    </Box>
  );
};

export default EditPatientForm;
