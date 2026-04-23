import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Marca */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={usuario ? "/catalogo" : "/login"} className="text-2xl font-bold text-blue-500 tracking-wider">
              MAGYM
            </Link>
          </div>

          {/* Menú de la derecha dinámico */}
          <div className="flex items-center space-x-4 border-l pl-4 border-gray-700">
            {usuario ? (
              <>
                <span className="hidden md:block text-gray-300 font-medium">Hola, {usuario.nombre}</span>
                <Link to="/catalogo" className="hover:text-blue-400 px-3 py-2 rounded-md transition">Catálogo</Link>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium transition shadow-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md font-medium transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;