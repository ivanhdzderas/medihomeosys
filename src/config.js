import React, { useState, useEffect, useCallback } from 'react';
import { 
    TextField, 
    Button, 
    Typography, 
    Container, 
    Box, 
    Select, 
    MenuItem, 
    InputLabel, 
    FormControl,
    Grid,
    Switch,
    FormControlLabel 
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from './axiosConfig';
export default function MedicoConfiguracion() {
    const [medico, setMedico] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        cedula: '',
        diasTrabajo: [], // Asegurarse de que sea un array
        horarioTrabajo: {}, // Asegurarse de que sea un objeto
        horarioComida: {}, // Asegurarse de que sea un objeto
        fondoPDF: null,
        margenTop: 10,
        margenBottom: 10,
        margenLeft: 10,
        margenRight: 10,
    });

    // Nuevo estado para controlar clonación de horarios
    const [clonarHorarios, setClonarHorarios] = useState(false);
    const [horarioBase, setHorarioBase] = useState({
        trabajoInicio: '',
        trabajoFin: '',
        comidaInicio: '',
        comidaFin: ''
    });

    useEffect(() => {
        axios.get(`api/medico/configuracion`)
            .then(response => {
                const data = response.data;
                try {
                    // Asegurarse de que los JSON strings se parseen correctamente
                    const diasTrabajo = typeof data.dias_trabajo === 'string' 
                        ? JSON.parse(data.dias_trabajo) 
                        : data.dias_trabajo;
    
                    const horarioTrabajo = typeof data.horario_trabajo === 'string' 
                        ? JSON.parse(data.horario_trabajo) 
                        : data.horario_trabajo;
    
                    const horarioComida = typeof data.horario_comida === 'string' 
                        ? JSON.parse(data.horario_comida) 
                        : data.horario_comida;
    
                    console.log('Datos cargados:', {
                        diasTrabajo,
                        horarioTrabajo,
                        horarioComida
                    });
    
                    setMedico({
                        nombre: data.nombre || '',
                        direccion: data.direccion || '',
                        telefono: data.telefono || '',
                        cedula: data.cedula || '',
                        diasTrabajo: diasTrabajo || [],
                        horarioTrabajo: horarioTrabajo || {},
                        horarioComida: horarioComida || {},
                        fondoPDF: null,
                        margenTop: data.margen_top || 10,
                        margenBottom: data.margen_bottom || 10,
                        margenLeft: data.margen_left || 10,
                        margenRight: data.margen_right || 10,
                    });
                } catch (error) {
                    console.error('Error parsing JSON data:', error);
                    console.log('Raw data received:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching medico data:', error);
                alert('Error al cargar la configuración del médico');
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMedico(prevState => ({ ...prevState, [name]: value }));
    };

    const handleDiasTrabajoChange = (e) => {
        const { value } = e.target;
        // Asegurar que siempre sea un array
        const diasArray = Array.isArray(value) ? value : [value];
        setMedico(prevState => ({ ...prevState, diasTrabajo: diasArray }));
    };

    const handleHorarioChange = useCallback((day, field, value) => {
        setMedico(prevState => ({
            ...prevState,
            horarioTrabajo: {
                ...prevState.horarioTrabajo,
                [day]: {
                    ...prevState.horarioTrabajo[day],
                    [field]: value
                }
            }
        }));
    }, []);

    const handleComidaChange = useCallback((day, field, value) => {
        setMedico(prevState => ({
            ...prevState,
            horarioComida: {
                ...prevState.horarioComida,
                [day]: {
                    ...prevState.horarioComida[day],
                    [field]: value
                }
            }
        }));
    }, []);

    const onDrop = useCallback((acceptedFiles) => {
        setMedico(prevState => ({ ...prevState, fondoPDF: acceptedFiles[0] }));
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    // Función para clonar horarios
    // Función para clonar horarios
    const aplicarHorariosBase = () => {
        const nuevosHorarios = {};
        const nuevosHorariosComida = {};

        medico.diasTrabajo.forEach(dia => {
            nuevosHorarios[dia] = {
                inicio: horarioBase.trabajoInicio,
                fin: horarioBase.trabajoFin
            };
            nuevosHorariosComida[dia] = {
                inicio: horarioBase.comidaInicio,
                fin: horarioBase.comidaFin
            };
        });

        setMedico(prev => ({
            ...prev,
            horarioTrabajo: nuevosHorarios,
            horarioComida: nuevosHorariosComida
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!medico.nombre || !medico.direccion || !medico.telefono || !medico.cedula) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
    
        try {
            const formData = new FormData();
            
            // Datos básicos
            formData.append('nombre', medico.nombre);
            formData.append('direccion', medico.direccion);
            formData.append('telefono', medico.telefono);
            formData.append('cedula', medico.cedula);
            
            // Asegurar que los días de trabajo sean un array JSON válido
            // Convertir explícitamente a array si no lo es
            const diasTrabajoArray = Array.isArray(medico.diasTrabajo) 
                ? medico.diasTrabajo 
                : medico.diasTrabajo.split(',');
                
            formData.append('dias_trabajo', JSON.stringify(diasTrabajoArray));
            
            // Asegurar que los horarios sean objetos JSON válidos
            const horarioTrabajoObj = {};
            const horarioComidaObj = {};
            
            diasTrabajoArray.forEach(dia => {
                if (medico.horarioTrabajo[dia]) {
                    horarioTrabajoObj[dia] = {
                        inicio: medico.horarioTrabajo[dia].inicio || '',
                        fin: medico.horarioTrabajo[dia].fin || ''
                    };
                }
                if (medico.horarioComida[dia]) {
                    horarioComidaObj[dia] = {
                        inicio: medico.horarioComida[dia].inicio || '',
                        fin: medico.horarioComida[dia].fin || ''
                    };
                }
            });
    
            formData.append('horario_trabajo', JSON.stringify(horarioTrabajoObj));
            formData.append('horario_comida', JSON.stringify(horarioComidaObj));
            
            // Márgenes
            formData.append('margen_top', medico.margenTop);
            formData.append('margen_bottom', medico.margenBottom);
            formData.append('margen_left', medico.margenLeft);
            formData.append('margen_right', medico.margenRight);
            
            // Fondo PDF si existe
            if (medico.fondoPDF) {
                formData.append('fondo_pdf', medico.fondoPDF);
            }
    
            // Debug: Verificar los datos antes de enviar
            console.log('Días trabajo:', JSON.stringify(diasTrabajoArray));
            console.log('Horario trabajo:', JSON.stringify(horarioTrabajoObj));
            console.log('Horario comida:', JSON.stringify(horarioComidaObj));
    
            const response = await axios.post(`api/medico/configuracion`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
            if (response.data.error) {
                throw new Error(response.data.error);
            }
    
            alert('Configuración guardada exitosamente');
        } catch (error) {
            console.error('Error completo:', error);
            alert(`Error al guardar la configuración: ${error.message}`);
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Configuración del Médico
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Nombre"
                    name="nombre"
                    value={medico.nombre}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Dirección"
                    name="direccion"
                    value={medico.direccion}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Teléfono"
                    name="telefono"
                    value={medico.telefono}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Cédula Profesional"
                    name="cedula"
                    value={medico.cedula}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="dias-trabajo-label">Días de Trabajo</InputLabel>
                    <Select
                        labelId="dias-trabajo-label"
                        multiple
                        value={medico.diasTrabajo}
                        onChange={handleDiasTrabajoChange}
                    >
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                            <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Sección de clonación de horarios */}
                <Box sx={{ mt: 4, mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={clonarHorarios}
                                onChange={(e) => setClonarHorarios(e.target.checked)}
                            />
                        }
                        label="Usar mismo horario de Lunes a Viernes"
                    />
                </Box>

                {clonarHorarios ? (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6">Horario Base</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Horario de Trabajo</Typography>
                                <TextField
                                    label="Hora de Inicio"
                                    type="time"
                                    value={horarioBase.trabajoInicio}
                                    onChange={(e) => setHorarioBase(prev => ({
                                        ...prev,
                                        trabajoInicio: e.target.value
                                    }))}
                                    margin="normal"
                                    fullWidth
                                />
                                <TextField
                                    label="Hora de Fin"
                                    type="time"
                                    value={horarioBase.trabajoFin}
                                    onChange={(e) => setHorarioBase(prev => ({
                                        ...prev,
                                        trabajoFin: e.target.value
                                    }))}
                                    margin="normal"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Horario de Comida</Typography>
                                <TextField
                                    label="Hora de Inicio"
                                    type="time"
                                    value={horarioBase.comidaInicio}
                                    onChange={(e) => setHorarioBase(prev => ({
                                        ...prev,
                                        comidaInicio: e.target.value
                                    }))}
                                    margin="normal"
                                    fullWidth
                                />
                                <TextField
                                    label="Hora de Fin"
                                    type="time"
                                    value={horarioBase.comidaFin}
                                    onChange={(e) => setHorarioBase(prev => ({
                                        ...prev,
                                        comidaFin: e.target.value
                                    }))}
                                    margin="normal"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button 
                                    variant="contained" 
                                    onClick={aplicarHorariosBase}
                                    fullWidth
                                >
                                    Aplicar horarios
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    // Horarios individuales por día
                    medico.diasTrabajo.map(day => (
                        <Box key={day} marginBottom={2}>
                            <Typography variant="h6">{day}</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Horario de Trabajo</Typography>
                                    <TextField
                                        label="Hora de Inicio"
                                        type="time"
                                        value={medico.horarioTrabajo[day]?.inicio || ''}
                                        onChange={(e) => handleHorarioChange(day, 'inicio', e.target.value)}
                                        margin="normal"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Hora de Fin"
                                        type="time"
                                        value={medico.horarioTrabajo[day]?.fin || ''}
                                        onChange={(e) => handleHorarioChange(day, 'fin', e.target.value)}
                                        margin="normal"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Horario de Comida</Typography>
                                    <TextField
                                        label="Hora de Inicio"
                                        type="time"
                                        value={medico.horarioComida[day]?.inicio || ''}
                                        onChange={(e) => handleComidaChange(day, 'inicio', e.target.value)}
                                        margin="normal"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Hora de Fin"
                                        type="time"
                                        value={medico.horarioComida[day]?.fin || ''}
                                        onChange={(e) => handleComidaChange(day, 'fin', e.target.value)}
                                        margin="normal"
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    ))
                )}

                <TextField
                    label="Margen Superior"
                    name="margenTop"
                    type="number"
                    value={medico.margenTop}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Margen Inferior"
                    name="margenBottom"
                    type="number"
                    value={medico.margenBottom}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Margen Izquierdo"
                    name="margenLeft"
                    type="number"
                    value={medico.margenLeft}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Margen Derecho"
                    name="margenRight"
                    type="number"
                    value={medico.margenRight}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <div {...getRootProps()} style={{ border: '2px dashed #aaa', padding: '20px', marginTop: '16px' }}>
                    <input {...getInputProps()} />
                    <Typography>Añadir Fondo para PDF</Typography>
                </div>
                {medico.fondoPDF && <Typography>{medico.fondoPDF.name}</Typography>}
                <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit" 
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Guardar Configuración
                </Button>
            </form>
        </Container>
    );
}