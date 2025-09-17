import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { 
    Dialog, DialogActions, DialogContent, DialogTitle, Button, 
    Typography, Container, TextField, Box, Grid, Alert, IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from '../axiosConfig';


const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const dayNames = {
    0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
    4: 'Jueves', 5: 'Viernes', 6: 'Sábado'
};

export default function PatientScheduler() {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ 
        title: '', start: null, end: null
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [selectedNewDate, setSelectedNewDate] = useState(null);
    const [selectedNewStart, setSelectedNewStart] = useState(null);
    const [medicoConfig, setMedicoConfig] = useState(null);
    const [error, setError] = useState(null);
    const [isRescheduling, setIsRescheduling] = useState(false);

    useEffect(() => {
        const fetchEventsAndConfig = async () => {
            try {
                const eventsResponse = await axios.get(`api/events`);
                const loadedEvents = eventsResponse.data.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                }));
                setEvents(loadedEvents);
    
                const configResponse = await axios.get(`api/medico/configuracion`);
                const data = configResponse.data;
                
                const parseJsonSafe = (jsonString) => {
                    try {
                        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
                    } catch (e) {
                        return null;
                    }
                };
                
                setMedicoConfig({
                    ...data,
                    dias_trabajo: parseJsonSafe(data.dias_trabajo) || [],
                    horario_trabajo: parseJsonSafe(data.horario_trabajo) || {},
                    horario_comida: parseJsonSafe(data.horario_comida) || {}
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar la información necesaria');
            }
        };
    
        fetchEventsAndConfig();
    }, []);

    const isWithinMedicoSchedule = (start, end) => {
        if (!medicoConfig) return false;
        const startMoment = moment(start);
        const dayName = dayNames[startMoment.day()];
        if (!medicoConfig.dias_trabajo.includes(dayName)) {
            return false;
        }
        const diaHorarioTrabajo = medicoConfig.horario_trabajo[dayName];
        const diaHorarioComida = medicoConfig.horario_comida[dayName];
        
        if (!diaHorarioTrabajo || !diaHorarioTrabajo.inicio || !diaHorarioTrabajo.fin) {
            return false;
        }
        const inicioTrabajo = moment(startMoment.format('YYYY-MM-DD') + ' ' + diaHorarioTrabajo.inicio);
        const finTrabajo = moment(startMoment.format('YYYY-MM-DD') + ' ' + diaHorarioTrabajo.fin);

        const dentroHorarioTrabajo = startMoment.isSameOrAfter(inicioTrabajo) && moment(end).isSameOrBefore(finTrabajo);
        
        if (!dentroHorarioTrabajo) {
            return false;
        }
        if (diaHorarioComida && diaHorarioComida.inicio && diaHorarioComida.fin) {
            const inicioComida = moment(startMoment.format('YYYY-MM-DD') + ' ' + diaHorarioComida.inicio);
            const finComida = moment(startMoment.format('YYYY-MM-DD') + ' ' + diaHorarioComida.fin);
            const seSolapaComida = (startMoment.isBefore(finComida) && moment(end).isAfter(inicioComida));
            
            if (seSolapaComida) {
                return false;
            }
        }
        return true;
    };

    const handleSelectSlot = ({ start }) => {
        const selectedMoment = moment(start);
        const dayName = dayNames[selectedMoment.day()];
        
        if (!medicoConfig || !medicoConfig.dias_trabajo.includes(dayName)) {
            alert('El médico no trabaja este día.');
            return;
        }
        setNewEvent({ title: '', start, end: null }); 
        setSelectedEvent(null);
        setMotivo('');
        setSelectedNewDate(null);
        setSelectedNewStart(null);
        setIsRescheduling(false);
        setOpen(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setNewEvent({
            id: event.id,
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end)
        });
        setMotivo('');
        setSelectedNewDate(null);
        setSelectedNewStart(null);
        setIsRescheduling(false);
        setOpen(true);
    };
    
    const handleReprogramarClick = () => {
        setIsRescheduling(true);
        setSelectedNewDate(selectedEvent.start);
    };
    
    const handleTimeSelect = (time) => {
        let dateToUse = selectedEvent ? selectedNewDate : newEvent.start;
        if (!dateToUse) return;

        let start = moment(dateToUse).set({
            hour: moment(time, 'HH:mm').hour(),
            minute: moment(time, 'HH:mm').minute()
        }).toDate();
        
        if (selectedEvent) {
            setSelectedNewStart(start);
        } else {
            setNewEvent(prev => ({ ...prev, start, end: moment(start).add(30, 'minutes').toDate() }));
        }
    };

    const handleClose = () => {
        setOpen(false);
        setNewEvent({ title: '', start: null, end: null });
        setSelectedEvent(null);
        setMotivo('');
        setSelectedNewDate(null);
        setSelectedNewStart(null);
        setError(null);
        setIsRescheduling(false);
    };

    const handleSave = () => {
        let updatedEvent;
        
        if (isRescheduling) {
            if (!motivo.trim() || !selectedNewStart) {
                alert('Por favor, ingrese el motivo y seleccione un nuevo horario.');
                return;
            }
            const oldStartFormatted = moment(selectedEvent.start).format('DD/MM/YYYY hh:mm A');
            const newStartFormatted = moment(selectedNewStart).format('DD/MM/YYYY hh:mm A');
            const motivoCompleto = `Cambio de ${oldStartFormatted} a ${newStartFormatted}, motivo: ${motivo}`;
            
            updatedEvent = {
                id: selectedEvent.id,
                title: selectedEvent.title,
                start: moment(selectedNewStart).format('YYYY-MM-DD HH:mm:ss'),
                end: moment(selectedNewStart).add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
                motivo: motivoCompleto
            };
        } else if (selectedEvent) {
            if (!newEvent.title.trim()) {
                 alert('El nombre del paciente no puede estar vacío.');
                 return;
            }
            updatedEvent = {
                id: selectedEvent.id,
                title: newEvent.title,
                start: moment(selectedEvent.start).format('YYYY-MM-DD HH:mm:ss'),
                end: moment(selectedEvent.end).format('YYYY-MM-DD HH:mm:ss')
            };
        } else {
            if (!newEvent.title.trim() || !newEvent.start) {
                alert('Por favor, complete todos los campos.');
                return;
            }
            const isOverlapping = events.some(event =>
                (moment(newEvent.start).isBefore(moment(event.end)) && 
                 moment(newEvent.end).isAfter(moment(event.start)))
            );
            if (isOverlapping) {
                alert('Ya existe una cita en este horario.');
                return;
            }
            const eventToSave = {
                ...newEvent,
                start: moment(newEvent.start).format('YYYY-MM-DD HH:mm:ss'),
                end: moment(newEvent.end).format('YYYY-MM-DD HH:mm:ss')
            };

            axios.post('/api/events', eventToSave)
                .then(response => {
                    setEvents([...events, { ...newEvent, id: response.data.id }]);
                    handleClose();
                })
                .catch(error => {
                    console.error('Error saving event:', error);
                    setError('Error al guardar la cita');
                });
                return;
        }
        
        axios.put(`api/events/${updatedEvent.id}`, updatedEvent)
            .then(() => {
                const updatedEvents = events.map(ev => 
                    ev.id === updatedEvent.id ? { 
                        ...ev, 
                        title: updatedEvent.title || ev.title, 
                        start: new Date(updatedEvent.start), 
                        end: new Date(updatedEvent.end), 
                        motivo: updatedEvent.motivo || ev.motivo 
                    } : ev
                );
                setEvents(updatedEvents);
                handleClose();
            })
            .catch(error => {
                console.error('Error updating event:', error);
                setError('Error al actualizar la cita');
            });
    };

    const handleEventDrop = ({ event, start, end }) => {
        if (!isWithinMedicoSchedule(start, end)) {
            alert('La nueva hora de la cita está fuera del horario de trabajo o en la hora de comida.');
            return;
        }
        const isOverlapping = events.some(ev =>
            ev.id !== event.id && (moment(start).isBefore(moment(ev.end)) && moment(end).isAfter(moment(ev.start)))
        );
        if (isOverlapping) {
            alert('Ya existe una cita en este horario.');
            return;
        }
        
        const oldStartFormatted = moment(event.start).format('DD/MM/YYYY hh:mm A');
        const newStartFormatted = moment(start).format('DD/MM/YYYY hh:mm A');
        const motivoCompleto = `Cambio de ${oldStartFormatted} a ${newStartFormatted}, motivo: Cita reprogramada por el calendario`;

        const updatedEvent = {
            id: event.id,
            title: event.title,
            start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
            end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
            motivo: motivoCompleto
        };
        
        axios.put(`api/events/${updatedEvent.id}`, updatedEvent)
            .then(() => {
                const updatedEvents = events.map(ev => 
                    ev.id === updatedEvent.id ? { ...ev, start, end, motivo: updatedEvent.motivo } : ev
                );
                setEvents(updatedEvents);
            })
            .catch(error => {
                console.error('Error updating event:', error);
                setError('Error al actualizar la cita');
            });
    };

    const handleDelete = () => {
        if (selectedEvent && selectedEvent.id) {
            axios.delete(`api/events/${selectedEvent.id}`)
                .then(() => {
                    setEvents(events.filter(event => event.id !== selectedEvent.id));
                    handleClose();
                })
                .catch(error => {
                    console.error('Error deleting event:', error);
                    setError('Error al eliminar la cita');
                });
        }
    };

    const getAvailableTimes = (date, eventId = null) => {
        if (!medicoConfig || !date) return [];
        const selectedDay = dayNames[moment(date).day()];
        const horarioTrabajo = medicoConfig.horario_trabajo[selectedDay];
        const horarioComida = medicoConfig.horario_comida[selectedDay];
        
        if (!horarioTrabajo || !horarioTrabajo.inicio || !horarioTrabajo.fin) {
            return [];
        }
        
        const times = [];
        let currentTime = moment(horarioTrabajo.inicio, 'HH:mm');
        const endTime = moment(horarioTrabajo.fin, 'HH:mm');
        
        while (currentTime.isBefore(endTime)) {
            const slotStart = moment(date).hours(currentTime.hours()).minutes(currentTime.minutes());
            const slotEnd = moment(slotStart).add(30, 'minutes');
            
            let isTimeSlotTaken = events.some(event => 
                event.id !== eventId && (slotStart.isBefore(moment(event.end)) && slotEnd.isAfter(moment(event.start)))
            );
            
            if (horarioComida && horarioComida.inicio && horarioComida.fin) {
                const comidaInicio = moment(date).hours(moment(horarioComida.inicio, 'HH:mm').hours()).minutes(moment(horarioComida.inicio, 'HH:mm').minutes());
                const comidaFin = moment(date).hours(moment(horarioComida.fin, 'HH:mm').hours()).minutes(moment(horarioComida.fin, 'HH:mm').minutes());
                const isDuringLunch = (slotStart.isBefore(comidaFin) && slotEnd.isAfter(comidaInicio));
                if (isDuringLunch) {
                    isTimeSlotTaken = true;
                }
            }
            if (!isTimeSlotTaken) {
                times.push(currentTime.format('HH:mm'));
            }
            currentTime.add(30, 'minutes');
        }
        return times;
    };
    
    // Corrección: Usar la fecha de newEvent para calcular los horarios disponibles
    const availableTimes = newEvent.start ? getAvailableTimes(newEvent.start) : [];
    const availableRescheduleTimes = selectedNewDate ? getAvailableTimes(selectedNewDate, selectedEvent.id) : [];

    const isNewAppointment = !selectedEvent;
    
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Planificador de Citas
            </Typography>
            <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{ height: 500 }}
                step={30}
                timeslots={1}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                draggableAccessor={() => true}
                resizableAccessor={() => true}
            />
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {isNewAppointment ? `Nueva Cita` : `Detalles de la Cita`}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}
                    {isNewAppointment ? (
                        <>
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                Horarios disponibles para {newEvent.start && moment(newEvent.start).format('DD MMMM YYYY')}:
                            </Typography>
                                <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: '4px', mt: 1, maxHeight: '200px', overflowY: 'auto' }}>
                                    <Grid container spacing={1}>
                                        {availableTimes.length > 0 ? (
                                            availableTimes.map(time => (
                                                <Grid item key={time}>
                                                    <Button 
                                                        variant={newEvent.start && moment(newEvent.start).format('HH:mm') === time ? 'contained' : 'outlined'}
                                                        onClick={() => handleTimeSelect(time)}
                                                    >
                                                        {time}
                                                    </Button>
                                                </Grid>
                                            ))
                                        ) : (
                                            <Grid item>
                                                <Typography>
                                                    No hay horarios disponibles para el día seleccionado.
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            <TextField
                                label="Nombre del Paciente"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                fullWidth
                                margin="dense"
                                error={!newEvent.title.trim()}
                                helperText={!newEvent.title.trim() ? 'El nombre es requerido' : ''}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="body1">
                                **Paciente:** {selectedEvent.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                **Horario actual:** {moment(selectedEvent.start).format('DD/MM/YYYY hh:mm A')}
                            </Typography>

                            {isRescheduling ? (
                                <>
                                    <Box sx={{ my: 2 }}>
                                        <Typography variant="h6">
                                            Seleccionar nuevo horario
                                        </Typography>
                                        <TextField
                                            label="Seleccionar nueva fecha"
                                            type="date"
                                            fullWidth
                                            margin="dense"
                                            InputLabelProps={{ shrink: true }}
                                            value={selectedNewDate ? moment(selectedNewDate).format('YYYY-MM-DD') : ''}
                                            onChange={(e) => {
                                                const newDate = moment(e.target.value).toDate();
                                                setSelectedNewDate(newDate);
                                                setSelectedNewStart(null);
                                            }}
                                        />
                                        {selectedNewDate && (
                                            <>
                                                <Typography variant="body1" sx={{ mt: 2 }}>
                                                    Horarios disponibles para {moment(selectedNewDate).format('DD/MM/YYYY')}:
                                                </Typography>
                                                <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: '4px', mt: 1, maxHeight: '200px', overflowY: 'auto' }}>
                                                    <Grid container spacing={1}>
                                                        {availableRescheduleTimes.length > 0 ? (
                                                            availableRescheduleTimes.map(time => (
                                                                <Grid item key={time}>
                                                                    <Button 
                                                                        variant={selectedNewStart && moment(selectedNewStart).format('HH:mm') === time ? 'contained' : 'outlined'}
                                                                        onClick={() => handleTimeSelect(time)}
                                                                        size="small"
                                                                    >
                                                                        {time}
                                                                    </Button>
                                                                </Grid>
                                                            ))
                                                        ) : (
                                                            <Grid item>
                                                                <Typography>
                                                                    No hay horarios disponibles para este día.
                                                                </Typography>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                    <TextField
                                        label="Motivo de la reprogramación"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        fullWidth
                                        margin="dense"
                                        multiline
                                        rows={3}
                                        required
                                        error={!motivo.trim()}
                                        helperText={!motivo.trim() ? 'El motivo es requerido' : ''}
                                    />
                                </>
                            ) : (
                                <>
                                    <TextField
                                        label="Nombre del Paciente"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                        fullWidth
                                        margin="dense"
                                        error={!newEvent.title.trim()}
                                        helperText={!newEvent.title.trim() ? 'El nombre es requerido' : ''}
                                    />
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cerrar</Button>
                    {selectedEvent && !isRescheduling && (
                        <>
                            <Button onClick={handleReprogramarClick}>Reprogramar</Button>
                            <Button onClick={handleDelete} color="error">Eliminar</Button>
                        </>
                    )}
                    <Button 
                        onClick={handleSave}
                        disabled={
                            (isNewAppointment && (!newEvent.title || !newEvent.start)) || 
                            (selectedEvent && isRescheduling && (!motivo || !selectedNewStart)) ||
                            (selectedEvent && !isRescheduling && !newEvent.title)
                        }
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}