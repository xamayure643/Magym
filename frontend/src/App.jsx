import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes
import Sidebar from './components/Sidebar';
import Registro from './pages/Registro';
// Páginas
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext } from 'react';

// Placeholders
const Dashboard = () => <div className="p-8 text-center bg-gray-50 min-h-screen">Página de Dashboard</div>;
const Rutinas = () => <div className="p-8 text-center bg-gray-50 min-h-screen">Página de Rutinas</div>;
const Nutricion = () => <div className="p-8 text-center bg-gray-50 min-h-screen">Página de Nutrición</div>;

const LoggedInLayout = ({ children }) => {
  const { usuario } = useContext(AuthContext);
  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      <Sidebar usuario={usuario} />
      {/* Contenedor principal que cede espacio al menú lateral en escritorio */}
      <main className="flex-grow w-full md:ml-64 relative overflow-hidden h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Rutas Públicas (Sin Sidebar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            
            {/* Rutas Privadas (Con Sidebar) */}
            <Route path="/catalogo" element={ <LoggedInLayout><Catalogo /></LoggedInLayout> } />
            <Route path="/dashboard" element={ <LoggedInLayout><Dashboard /></LoggedInLayout> } />
            <Route path="/rutinas" element={ <LoggedInLayout><Rutinas /></LoggedInLayout> } />
            <Route path="/nutricion" element={ <LoggedInLayout><Nutricion /></LoggedInLayout> } />
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;