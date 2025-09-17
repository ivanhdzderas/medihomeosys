// src/Login.js
import React, { useState } from 'react';
import axios from './axiosConfig'; // ✅ Importa desde tu configuración
import { TextField, Button, Box, Typography, Container, CssBaseline, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ USA /api/login - El proxy lo redirigirá a /prueba/api/login
      const response = await axios.post('/api/login', { 
        email, 
        password 
      }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data.message === 'Inicio de sesión exitoso') {
        onLoginSuccess();
      } else {
        setError(response.data.error || 'Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('Error completo:', error);
      
      // Manejo específico de errores
      if (error.response?.status === 0 || error.code === 'NETWORK_ERROR') {
        setError('Error de conexión. Verifica la configuración del servidor.');
      } else if (error.response?.status === 401) {
        setError('Credenciales incorrectas');
      } else if (error.response?.status === 403) {
        setError('Acceso denegado. Contacta al administrador.');
      } else if (error.response?.status === 404) {
        setError('Endpoint no encontrado. Verifica la URL.');
      } else if (error.response?.status === 500) {
        setError('Error interno del servidor.');
      } else {
        setError(error.response?.data?.error || 'Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box component="img" sx={{ height: 100, marginBottom: 2 }} alt="Logo" src="logo2.png" />
          <Typography component="h1" variant="h5">Iniciar Sesión</Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;