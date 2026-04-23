import React, { useState, useEffect } from 'react';
import { obtenerEjercicios, agregarFavorito } from '../services/api';

const Catalogo = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  
  // ESTE ES EL NUEVO ESTADO PARA LOS FILTROS DINÁMICOS
  const [gruposDisponibles, setGruposDisponibles] = useState([]); 

  useEffect(() => {
    let unmounted = false;
    
    const cargarDatos = async () => {
      setCargando(true);
      setMensaje(null);
      
      try {
        const data = await obtenerEjercicios(filtro);
        if (!unmounted) {
          setEjercicios(data);

          // Si es la carga inicial sin filtro, generamos el desplegable automáticamente
          if (filtro === '' && gruposDisponibles.length === 0) {
            const gruposUnicos = new Set();
            data.forEach(ej => {
              if (ej.grupo_muscular) {
                // Como los grupos vienen "Hombros, Tríceps", los cortamos y limpiamos
                ej.grupo_muscular.split(',').forEach(g => {
                   const limpiarG = g.trim();
                   if (limpiarG && limpiarG !== 'General') {
                     gruposUnicos.add(limpiarG);
                   }
                });
              }
            });
            // Convertimos a un Array normal, los ordenamos y los guardamos
            setGruposDisponibles(Array.from(gruposUnicos).sort());
          }
        }
      } catch (error) {
        if (!unmounted) {
          setMensaje({ 
            tipo: 'error', 
            texto: error.detail || error.error || 'Error al cargar ejercicios.' 
          });
        }
      } finally {
        if (!unmounted) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => {
      unmounted = true;
    };
  }, [filtro]); // Este alert de eslint abajo de tu código se puede quitar si quieres usando dependencias vacias

  const handleMarcarFavorito = async (idEjercicio) => {
    try {
      const res = await agregarFavorito(idEjercicio);
      setMensaje({ tipo: 'exito', texto: res.mensaje || 'Añadido a favoritos' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.detail || error.error || 'Error al añadir a favoritos' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Catálogo de Ejercicios</h1>
          
          {/* Dropdown de Filtro DINÁMICO */}
          <select 
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="">Cualquier Grupo Muscular</option>
            {gruposDisponibles.map(grupo => (
              <option key={grupo} value={grupo}>{grupo}</option>
            ))}
          </select>
        </div>

        {/* Mensajes de Alerta */}
        {mensaje && (
          <div className={`p-4 mb-6 rounded-md ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Grid de Tarjetas */}
        {cargando ? (
          <p className="text-center text-gray-500">Cargando catálogo...</p>
        ) : ejercicios.length === 0 ? (
          <p className="text-center text-gray-500">No se encontraron ejercicios con ese criterio.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ejercicios.map((ejercicio) => (
              <div key={ejercicio.id_ejercicio} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ejercicio.nombre}</h3>
                    
                    {/* Botón de Favorito */}
                    <button 
                      onClick={() => handleMarcarFavorito(ejercicio.id_ejercicio)}
                      className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none flex-shrink-0 ml-4"
                      title="Añadir a favoritos"
                    >
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full uppercase font-semibold tracking-wide mb-4 line-clamp-1">
                    {ejercicio.grupo_muscular}
                  </span>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3" title={ejercicio.descripcion}>
                    {ejercicio.descripcion}
                  </p>
                  
                  {ejercicio.guia_ejecucion && (
                    <a 
                      href={ejercicio.guia_ejecucion} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-2 border-t pt-3"
                    >
                      📺 Ver guía de ejecución / vídeo &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;