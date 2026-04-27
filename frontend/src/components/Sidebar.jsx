import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const Sidebar = ({ usuario }) => {
  const { logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const enlaceActivo = (ruta) => location.pathname === ruta 
    ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 border-l-4 border-blue-600 font-semibold' 
    : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200 border-l-4 border-transparent tracking-wide text-sm font-medium';

  if (!usuario) return null;

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-4 fixed w-full top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <img 
            src={isDarkMode ? "/magym_oscuro.png" : "/magym_claro.png"} 
            alt="MAGYM Logo" 
            className="h-12 w-auto object-contain" 
          />        
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none text-gray-500 dark:text-zinc-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 w-64 h-full transform transition-all duration-300 ease-in-out z-40 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}
      >
        <div className="flex flex-col items-center px-6 pt-20 pb-6 md:pt-6 text-center">
          <div className="mb-2 flex justify-center">
            <img 
              src={isDarkMode ? "/magym_oscuro.png" : "/magym_claro.png"} 
              alt="MAGYM Logo" 
              className="h-20 w-auto object-contain" 
            />          
          </div>          
          <span className="text-gray-500 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Plan para {usuario.nombre}
          </span>
        </div>

        <nav className="flex-1 mt-4 flex flex-col space-y-1 px-2">
          <Link to="/catalogo" onClick={() => setIsOpen(false)} className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${enlaceActivo('/catalogo')}`}>
             Catálogo
          </Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${enlaceActivo('/dashboard')}`}>
            Estadísticas
          </Link>
          <Link to="/rutinas" onClick={() => setIsOpen(false)} className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${enlaceActivo('/rutinas')}`}>
            Mis Rutinas
          </Link>
          <Link to="/progreso" onClick={() => setIsOpen(false)} className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${enlaceActivo('/progreso')}`}>
            Registro Diario
          </Link>
          <Link to="/nutricion" onClick={() => setIsOpen(false)} className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${enlaceActivo('/nutricion')}`}>
            Nutrición
          </Link>
        </nav>

        <div className="p-6 flex flex-col gap-3 border-t border-gray-200 dark:border-zinc-800 transition-colors">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-sm font-bold py-3 rounded-xl transition-all duration-200 shadow-md"
          >
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          
          <button 
            onClick={logout} 
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 text-gray-700 dark:text-zinc-300 text-sm font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;