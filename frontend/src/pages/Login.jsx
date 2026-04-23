import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { loginUsuario } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login } = useContext(AuthContext);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await loginUsuario(formData);
      login(data); // Ejecuta el contexto que guarda token y nos lleva al catálogo
    } catch (err) {
      // Manejamos los bloqueos si la cuenta está sin validar por SMS u otros errores
      setError(err.error || err.detail || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-blue-600 hover:text-blue-500 transition">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="correo">
                Correo Electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="tu@email.com"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contrasena">
                Contraseña
              </label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="••••••••"
                value={formData.contrasena}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              cargando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            } transition`}
          >
            {cargando ? 'Accediendo...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;