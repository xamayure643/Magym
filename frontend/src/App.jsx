import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes
import Sidebar from './components/Sidebar';
import Registro from './pages/Registro';
import Rutinas from './pages/Rutinas';
import Progreso from './pages/Progreso';
import Dashboard from './pages/Dashboard';
// Páginas
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Nutricion = () => <div className="p-8 text-center bg-gray-50 dark:bg-zinc-950 text-gray-500 min-h-screen font-medium transition-colors duration-300">Bajo Construcción: Nutrición</div>;

const LoggedInLayout = ({ children }) => {
  const { usuario } = useContext(AuthContext);
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 relative selection:bg-blue-500 selection:text-white transition-colors duration-300">
      <Sidebar usuario={usuario} />
      <main className="flex-grow w-full md:ml-64 relative overflow-hidden h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              
              <Route path="/catalogo" element={ <LoggedInLayout><Catalogo /></LoggedInLayout> } />
              <Route path="/dashboard" element={ <LoggedInLayout><Dashboard /></LoggedInLayout> } />
              <Route path="/rutinas" element={ <LoggedInLayout><Rutinas /></LoggedInLayout> } />
              <Route path="/nutricion" element={ <LoggedInLayout><Nutricion /></LoggedInLayout> } />
              <Route path="/progreso" element={ <LoggedInLayout><Progreso /></LoggedInLayout> } />
            </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;