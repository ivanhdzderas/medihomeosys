import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import Pacientes from './pacientes/pacientes';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Agenda from "./agenda/agenda";
import MedicoConfiguracion from './config';
import Login from './login'; // Importa el componente Login
import config from './config'; // Importa la configuración
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import Telefonos from './telefono';
const NAVIGATION = [
  { segment: 'Pacientes', title: 'Pacientes', icon: <MedicalServicesIcon  /> },
  { segment: 'Agenda', title: 'Agenda', icon: <CalendarMonthIcon /> },
  { segment: 'Telefonos', title: 'telefonos', icon: <ContactPhoneIcon /> },
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
      return <></>;
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default function Layout(props) {
  const { window } = props;
  const [pathname, setPathname] = React.useState('');
  const [authenticated, setAuthenticated] = React.useState(false); // Estado de autenticación
  
  const handleLoginSuccess = () => {
    setAuthenticated(true);
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
    >
      {authenticated ? (
        <DashboardLayout>
          <DemoPageContent pathname={pathname} />
        </DashboardLayout>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </AppProvider>
  );
}
