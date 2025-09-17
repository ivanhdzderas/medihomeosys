import React, { useState, useEffect } from 'react';
import { 
    DataGrid,
    GridToolbar
} from '@mui/x-data-grid';
import { 
    Container, 
    Typography, 
    Paper,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from './axiosConfig';

// Definición de columnas

const columns = [
    { 
        field: 'nombre', 
        headerName: 'Nombre del Paciente', 
        flex: 1,
        minWidth: 150, // Reducido para mejor visualización en móviles
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        renderCell: (params) => (
            <Typography 
                sx={{ 
                    fontWeight: 'medium',
                    fontSize: { xs: '0.875rem', sm: '1rem' } // Responsive font size
                }}
            >
                {params.value}
            </Typography>
        )
    },
    { 
        field: 'telefono', 
        headerName: 'Teléfono', // Acortado para móviles
        flex: 1,
        minWidth: 120, // Reducido para mejor visualización en móviles
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        renderCell: (params) => (
            <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {params.value || 'No disponible'}
            </Typography>
        )
    },
    { 
        field: 'email', 
        headerName: 'Correo', // Acortado para móviles
        flex: 1,
        minWidth: 150,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        renderCell: (params) => (
            <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {params.value || 'No disponible'}
            </Typography>
        )
    }
];

export default function Telefonos() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`api/directorio`);
                
                if (response.data && response.data.data) {
                    const formattedData = response.data.data.map(item => ({
                        id: item.id || Math.random(), // Aseguramos que siempre haya un id
                        nombre: item.nombre || 'Sin nombre',
                        telefono: item.telefono || 'No disponible',
                        email: item.email || 'No disponible'
                    }));
                    setRows(formattedData);
                } else {
                    setRows([]);
                }
            } catch (error) {
                console.error('Error al cargar el directorio:', error);
                setError('Error al cargar los datos del directorio. Por favor, intente más tarde.');
                setRows([]); // Aseguramos que rows sea un array vacío en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Validación inicial
    if (!Array.isArray(rows)) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Alert severity="error">Error en el formato de datos</Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                        color: 'primary.main',
                        fontWeight: 'bold',
                        mb: 4
                    }}
                >
                    Directorio Telefónico
                </Typography>
                <Paper elevation={3}>
                    <Box sx={{ height: 600, width: '100%', p: 2 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={pageSize}
                            loading={loading}
                            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            components={{
                                Toolbar: GridToolbar,
                                LoadingOverlay: CircularProgress,
                                NoRowsOverlay: () => (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '100%' 
                                    }}>
                                        No hay datos disponibles
                                    </Box>
                                )
                            }}
                            // ... resto de las props
                            initialState={{
                                pagination: {
                                    pageSize: 10,
                                },
                                sorting: {
                                    sortModel: [{ field: 'nombre', sort: 'asc' }],
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}