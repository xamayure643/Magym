import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes
import Navbar from './components/Navbar';
import Registro from './pages/Registro';
// Páginas
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';

// Placeholders
const Dashboard = () => <div className="p-8 text-center bg-gray-50 min-h-screen">Página de Dashboard</div>;
const Rutinas = () => <div className="p-8 text-center bg-gray-50 min-h-screen">Página de Rutinas</div>;
const Nutricion = () => <div className="p-8 text-center bg-gray-50 min-h-screen">Página de Nutrición</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar /> {/* Se renderiza en todas las páginas arriba del todo */}
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} /> {/* Default: al login */}
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rutinas" element={<Rutinas />} />
              <Route path="/nutricion" element={<Nutricion />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;