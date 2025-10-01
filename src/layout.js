import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
// 👇 Importación corregida: Obtenemos AppProvider, DashboardLayout y Account (para el logout) de @toolpad/core
import { AppProvider, DashboardLayout, Account } from '@toolpad/core'; 
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import Pacientes from './pacientes/pacientes';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Agenda from "./agenda/agenda";
import MedicoConfiguracion from './config';
import Login from './login'; // Importa el componente Login
import config from './config'; 
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import Telefonos from './telefono';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Icono para Logout


const NAVIGATION = [
 { segment: 'Pacientes', title: 'Pacientes', icon: <MedicalServicesIcon /> },
 { segment: 'Agenda', title: 'Agenda', icon: <CalendarMonthIcon /> },
 { segment: 'Telefonos', title: 'Telefonos', icon: <ContactPhoneIcon /> },
 { segment: 'Configuracion', title: 'Configuracion', icon: <SettingsIcon /> },
];

const demoTheme = createTheme({
 cssVariables: {
  colorSchemeSelector: 'data-toolpad-color-scheme',
 },
 colorSchemes: { light: true, dark: false },
 breakpoints: {
  values: {
   xs: 0,
   sm: 600,
   md: 600,
   lg: 1200,
   xl: 1536,
  },
 },
});

function DemoPageContent({ pathname }) {
 var path = pathname.replace("/", "");
 switch(path) {
  case 'Pacientes':
   return <Pacientes />;
  case 'Agenda':
   return <Agenda />;
  case 'Configuracion':
   return <MedicoConfiguracion />;
  case 'Telefonos':
   return <Telefonos />;
  default:
   // Página por defecto si está autenticado
   return <Pacientes />; 
 }
}

DemoPageContent.propTypes = {
 pathname: PropTypes.string.isRequired,
};

// Constante para la clave de la sesión en localStorage
const AUTH_TOKEN_KEY = 'authToken_innovate'; 

export default function Layout(props) {
 const { window } = props;
 const [pathname, setPathname] = React.useState('');
 
 // 1. Estado inicial: Comprueba si existe la clave de sesión en localStorage
 const [authenticated, setAuthenticated] = React.useState(!!localStorage.getItem(AUTH_TOKEN_KEY)); 
 
 
  // 2. Efecto para manejar la inicialización y la navegación por defecto
  React.useEffect(() => {
    // Si está autenticado y el pathname está vacío (primera carga), 
    // establece la ruta por defecto a 'Pacientes'.
    if (authenticated && !pathname) {
      setPathname('/Pacientes');
    }
  }, [authenticated, pathname]);

  // 3. Función de éxito de Login: Guarda la sesión y actualiza el estado
 const handleLoginSuccess = (token) => {
    // Guardamos una cadena simple ('SESSION_ACTIVE') ya que el backend no devuelve token.
    localStorage.setItem(AUTH_TOKEN_KEY, token || 'SESSION_ACTIVE'); 
  setAuthenticated(true);
    // Navegamos a la página principal después de iniciar sesión
    setPathname('/Pacientes'); 
 };
  
  // 4. Función de Cierre de Sesión (Logout)
  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY); // Eliminar el indicador de sesión
    setAuthenticated(false); // Cambiar el estado a desautenticado
    setPathname(''); // Limpiar la ruta para mostrar el Login
  };


 const router = React.useMemo(() => {
  return {
   pathname,
   searchParams: new URLSearchParams(),
   navigate: (path) => setPathname(String(path)),
  };
 }, [pathname]);

 // Remove this const when copying and pasting into your project.
 const demoWindow = window !== undefined ? window() : undefined;

  // 5. Componente de menú de usuario con la opción de Logout
  const UserMenuContent = (
    <>
      {/* Usamos el componente Account de Toolpad para el botón de Cerrar Sesión */}
      <Account
        title="Cerrar Sesión" 
        icon={<ExitToAppIcon />} 
        onClick={handleLogout} 
      />
    </>
  );

 return (
  <AppProvider
   navigation={NAVIGATION}
   branding={{
    logo: <img src="logo2.png" alt="MediHomeoSys Logo" />,
    title: ""
   }}
   router={router}
   theme={demoTheme}
   window={demoWindow}
      // Añadimos el menú de usuario que contiene el botón de Logout
      userMenuContent={authenticated ? UserMenuContent : undefined} 
  >
   {authenticated ? (
    <DashboardLayout>
     <DemoPageContent pathname={pathname} />
    </DashboardLayout>
   ) : (
        // Muestra el componente Login si no está autenticado
    <Login onLoginSuccess={handleLoginSuccess} />
   )}
  </AppProvider>
 );
}