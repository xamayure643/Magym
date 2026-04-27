import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { loginUsuario, verificarCodigoSms } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  // -- NUEVOS ESTADOS PARA VISTA DE VERIFICACIÓN --
  const [requiereVerificacion, setRequiereVerificacion] = useState(false);
  const [codigoSms, setCodigoSms] = useState('');
  // -----------------------------------------------

  const { login } = useContext(AuthContext);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await loginUsuario(formData);
      login(data);
    } catch (err) {
      // Si el error del backend indica que no está verificada, saltamos a la pantalla SMS
      const mensajeBackend = err.error || err.detail || '';
      if (mensajeBackend.toLowerCase().includes('verificada')) {
          setRequiereVerificacion(true);
      } else {
          setError(mensajeBackend || 'Error al iniciar sesión.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleVerificacion = async (e) => {
      e.preventDefault();
      setCargando(true);
      setError(null); 
      
      try {
          // Reutilizamos la función de verificar usarndo el correo que ya introdujo en el login
          const respuesta = await verificarCodigoSms(formData.correo, codigoSms);
          login(respuesta); // Auto-login tras verificar éxito
      } catch (err) {
          setError(err.error || "Error al verificar el código");
      } finally {
          setCargando(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 transition-colors duration-300">
        
        {/* VISTA 1: FORMULARIO NORMAL DE LOGIN */}
        {!requiereVerificacion ? (
          <>
            <div className="mb-8">
              <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Bienvenido de nuevo
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/registro" className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1" htmlFor="correo">
                    Correo Electrónico
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                    value={formData.correo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1" htmlFor="contrasena">
                    Contraseña
                  </label>
                  <input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    required
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={formData.contrasena}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${
                  cargando ? 'bg-blue-400 dark:bg-blue-500/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                } transition-all duration-200`}
              >
                {cargando ? 'Accediendo...' : 'Iniciar Sesión'}
              </button>
            </form>
          </>
        ) : (
          /* VISTA 2: FORMULARIO DE VERIFICACIÓN SMS */
          <form onSubmit={handleVerificacion} className="space-y-4">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
                  Verifica tu Cuenta
              </h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-6 font-medium">
                  Parece que aún no has verificado tu teléfono. Introduce el código SMS de 6 dígitos que te enviamos al registrarte.
              </p>
              
              <div>
                  <input 
                      type="text" 
                      name="codigoSms" 
                      value={codigoSms} 
                      onChange={(e) => setCodigoSms(e.target.value)} 
                      required 
                      placeholder="123456" 
                      maxLength={6}
                      className="w-full px-4 py-4 text-center tracking-[0.6em] text-2xl font-bold rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono" 
                  />
              </div>

              {error && <div className="text-red-500 text-sm font-bold text-center mt-2">{error}</div>}

              <button 
                  type="submit" 
                  disabled={cargando || codigoSms.length < 6} 
                  className="w-full py-4 mt-6 bg-green-600 hover:bg-green-500 active:scale-95 disabled:bg-gray-400 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500 text-white font-bold rounded-xl transition shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              >
                  {cargando ? 'Comprobando...' : 'Confirmar Identidad y Acceder'}
              </button>
              
              <button
                  type="button"
                  onClick={() => setRequiereVerificacion(false)}
                  className="w-full py-2 mt-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 font-bold transition-colors"
              >
                  ← Volver al login
              </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;