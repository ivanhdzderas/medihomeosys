import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from '../axiosConfig'; // ✅ Cambia esta importación
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import { TextField, Modal, Backdrop, Fade } from '@mui/material';
import Swal from 'sweetalert2';
import AddPatientStepper from './newpaciente';
import ConsultationsTimeline from './consultas';
import NewConsultation from './newconsulta';
import EditPatientForm from './editpaciente';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  maxHeight: '90vh',
};

const Pacientes = () => {
  const [filtro, setfiltro] = useState("");
  const [pacientes, setpacientes] = useState([]);
  const [filterpacient, setfilterpacient] = useState([]);
  const [open, setOpen] = useState(false);
  const [origen, setorigen] = useState("");
  const [paciente, setpaciente] = useState([]);
  const [anterior, setanterior] = useState("");
  const [pacienteAEditar, setPacienteAEditar] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const nueva_consulta = () => {
    setanterior("");
    setorigen("newconsulta");
  }
  
  const seguimiento = (idconsulta) => {
    setanterior(idconsulta);
    setorigen("newconsulta")
  }
  
  useEffect(() => {
    getpacientes();
  }, []);
  
  const reload = () => {
    setOpen(false);
    getpacientes();
  }
  
  const getpacientes = () => {
    axios
      .get('/api/getpacientes') // ✅ Cambia aquí
      .then((response) => {
        const result = response.data;
        setpacientes(result);
        setfilterpacient(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  const filtrar = (value) => {
    setfiltro(value);
    if (value === "") {
      setfilterpacient(pacientes);
    } else {
      var fil = pacientes.filter(item => item.nombre.toLowerCase().includes(value.toLowerCase()));
      setfilterpacient(fil);
    }
  }
  
  const handleNewConsultation = () => {
    setorigen("consultas");
  };

  const handleDeletePatient = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/pacientes/${id}`) // ✅ Cambia aquí
          .then(() => {
            Swal.fire(
              '¡Eliminado!',
              'El paciente ha sido eliminado.',
              'success'
            );
            getpacientes();
          })
          .catch(error => {
            Swal.fire(
              'Error!',
              'Hubo un problema al eliminar el paciente.',
              'error'
            );
          });
      }
    });
  };
  
  const handleEditPatient = (patient) => {
    setPacienteAEditar(patient);
    setOpen(true);
    setorigen("editarPaciente");
  };
  
  return (
    <>
      <Stack direction="row" spacing={2} sx={{ marginTop: '2%', marginLeft: "2%" }} >
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => {
          handleOpen();
          setorigen("paciente");
        }}>
          Nuevo Paciente
        </Button>
        <TextField id="filter" label="Filtro" variant="filled" value={filtro} onChange={value => {
          filtrar(value.target.value);
        }} />
      </Stack>
      <Box sx={{ flexGrow: 1, marginTop: '2%', marginLeft: "20px" }} >
        <Grid container spacing={2}>
          {filterpacient.map((item) =>
            <Grid xs={2} key={item.id}>
              <Card sx={{ maxWidth: 200 }} >
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {item.nombre}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton aria-label="delete" color="error" onClick={() => handleDeletePatient(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton aria-label="pdf" color="secondary" onClick={() => {
                    handleOpen();
                    setorigen("consultas");
                    var found = pacientes.filter(a => a.id == item.id);
                    setpaciente(found);
                  }} >
                    <FormatListBulletedIcon />
                  </IconButton>
                  <IconButton aria-label='Link' color='primary' onClick={() => handleEditPatient(item)} >
                    <EditIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
          {origen === "paciente" ? (
              <AddPatientStepper closeall={reload} />
            ) : (origen === "consultas" ? (
              <ConsultationsTimeline patientId={(paciente.length > 0) ? paciente[0].id : null} nueva_consulta={nueva_consulta} seguimiento={seguimiento} />
            ) : (origen === "editarPaciente" ? (
              <EditPatientForm paciente={pacienteAEditar} onEditCompleted={reload} />
            ) : (
              <NewConsultation idpaciente={(paciente.length > 0) ? paciente[0].id : null} onConsultaAdded={handleNewConsultation} anterior={anterior} />
            )))}
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
export default Pacientes;