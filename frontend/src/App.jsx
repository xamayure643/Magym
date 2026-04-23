import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './components/Registro';

// Aquí crearías (o importarías) componentes básicos (o vacíos por ahora) para las páginas
const Login = () => <div>Página de Login</div>;
const Dashboard = () => <div>Página de Dashboard</div>;
const Rutinas = () => <div>Página de Rutinas</div>;
const Nutricion = () => <div>Página de Nutrición</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rutinas" element={<Rutinas />} />
        <Route path="/nutricion" element={<Nutricion />} />
      </Routes>
    </Router>
  );
}

export default App;