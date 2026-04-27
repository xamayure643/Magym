import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = ({ usuario }) => {
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const enlaceActivo = (ruta) => location.pathname === ruta 
    ? 'bg-blue-800 text-white border-l-4 border-blue-400' 
    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent';

  if (!usuario) return null;

  return (
    <>
      {/* Mobile Header + Hamburguesa (Solo se ve en Smartphone) */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 border-b border-gray-800 text-white p-4 fixed w-full top-0 z-20">
        <span className="text-xl font-bold text-blue-500 tracking-wide">MAGYM</span>
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Overlay Oscuro Pantalla Completa (Solo sale en Smartphone y al abrir menú) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* BARRA LATERAL (Desktop y Mobile Abierto) */}
      <div className={`fixed inset-y-0 left-0 bg-gray-900 w-64 h-full transform transition-transform duration-300 ease-in-out z-40 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}
      >
        {/* Cabecera Sidebar */}
        <div className="px-6 py-8 md:py-10 flex flex-col pt-12 md:pt-10">
          <h2 className="text-3xl font-extrabold text-blue-500 tracking-wider text-center cursor-default">MAGYM</h2>
          <span className="text-gray-400 mt-2 text-center text-sm">Bienvenido, {usuario.nombre}</span>
        </div>

        {/* Links de Navegación  */}
        <nav className="flex-1 mt-6 flex flex-col space-y-1">
          <Link to="/catalogo" onClick={() => setIsOpen(false)} className={`pl-6 py-3 cursor-pointer transition-colors ${enlaceActivo('/catalogo')}`}>
             Catalogo de Ejercicios
          </Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`pl-6 py-3 cursor-pointer transition-colors ${enlaceActivo('/dashboard')}`}>
            Mi Dashboard
          </Link>
          <Link to="/rutinas" onClick={() => setIsOpen(false)} className={`pl-6 py-3 cursor-pointer transition-colors ${enlaceActivo('/rutinas')}`}>
            Mis Rutinas
          </Link>
          <Link to="/nutricion" onClick={() => setIsOpen(false)} className={`pl-6 py-3 cursor-pointer transition-colors ${enlaceActivo('/nutricion')}`}>
            Nutrición
          </Link>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={logout} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;