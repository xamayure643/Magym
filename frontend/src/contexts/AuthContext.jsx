/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUsuario } from '../services/api';

// 1. Exportamos el Contexto
export const AuthContext = createContext();

// 2. Exportamos el Proveedor
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Inicializamos el estado 
  const [usuario, setUsuario] = useState(() => {
    const token = localStorage.getItem('access');
    const storedUser = localStorage.getItem('usuario_nombre');
    
    if (token && storedUser) {
      return { nombre: storedUser, token };
    }
    return null;
  });

  const login = (data) => {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('usuario_nombre', data.nombre);
    
    setUsuario({ nombre: data.nombre, token: data.access });
    navigate('/catalogo');
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh');
    if (refresh) {
      await logoutUsuario(refresh);
    }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('usuario_nombre');
    
    setUsuario(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};