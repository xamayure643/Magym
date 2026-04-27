import React, { useState, useEffect } from 'react';
import { obtenerEjercicios, agregarFavorito, obtenerFavoritos } from '../services/api';


const Toast = ({ mensaje, onClose }) => {
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [mensaje, onClose]);

  if (!mensaje) return null;

  const isError = mensaje.tipo === 'error';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center min-w-[250px] max-w-sm p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform translate-x-0 ${isError ? 'bg-white border-red-500 text-red-700' : 'bg-white border-green-500 text-green-700'}`}>
      <div className="flex-1 font-medium">{mensaje.texto}</div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

const ImagenAnimada = ({ imagen1, imagen2, altTexto }) => {
  const [activa, setActiva] = useState(false);
  const [intervaloId, setIntervaloId] = useState(null);

  const handleMouseEnter = () => {
    if (imagen1 && imagen2) {
      const id = setInterval(() => {
        setActiva(prev => !prev);
      }, 700); 
      setIntervaloId(id);
    }
  };

  const handleMouseLeave = () => {
    if (intervaloId) clearInterval(intervaloId);
    setActiva(false); 
  };

  useEffect(() => {
    return () => { if (intervaloId) clearInterval(intervaloId); };
  }, [intervaloId]);

  return (
    <img 
      src={activa ? imagen2 : imagen1} 
      alt={altTexto} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full h-full object-cover transition-opacity duration-300 ${activa ? 'opacity-95' : 'opacity-100'}`} 
      loading="lazy" 
    />
  );
};

const TarjetaEjercicio = ({ ejercicio, esFavorito, handleMarcarFavorito }) => {
  const [expandido, setExpandido] = useState(false);
  const musculosArray = ejercicio.grupo_muscular ? ejercicio.grupo_muscular.split(',').map(m => m.trim()).filter(m => m) : [];
  
  const MAX_CARACTERES = 120;
  const descripcionCorta = ejercicio.descripcion 
    ? (ejercicio.descripcion.length > MAX_CARACTERES ? ejercicio.descripcion.substring(0, MAX_CARACTERES) + '...' : ejercicio.descripcion)
    : "Sin descripción oficial.";

  const necesitaExpansion = ejercicio.descripcion && ejercicio.descripcion.length > MAX_CARACTERES;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
      <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b shrink-0">
        {ejercicio.imagen_url ? (
          <ImagenAnimada 
            imagen1={ejercicio.imagen_url} 
            imagen2={ejercicio.imagen_url1} 
            altTexto={ejercicio.nombre} 
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="text-sm border p-1 rounded-md">Sin imagen</span>
          </div>
        )}
        <button onClick={() => handleMarcarFavorito(ejercicio.id_ejercicio)} className={`absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md transition-transform hover:scale-110 focus:outline-none ${esFavorito ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} title={esFavorito ? "En favoritos" : "Añadir a favoritos"}>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{ejercicio.nombre}</h3>
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {musculosArray.map((musculo, index) => (
            <span key={index} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
              {musculo}
            </span>
          ))}
        </div>
        
        {/* Descripción Expandible (Ocupa el espacio sobrante con flex-1) */}
        <div className="flex-1 mb-4 flex flex-col justify-start">
            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {expandido ? ejercicio.descripcion : descripcionCorta}
            </p>
            {necesitaExpansion && (
              <button 
                onClick={() => setExpandido(!expandido)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2 focus:outline-none self-start"
              >
                {expandido ? "Leer menos ↑" : "Ver instrucciones enteras ↓"}
              </button>
            )}
        </div>
        
        {ejercicio.guia_ejecucion && (
          <a href={ejercicio.guia_ejecucion} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold py-2 rounded-md transition-colors mt-auto border border-red-100 shrink-0">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            Ver tutorial de YouTube
          </a>
        )}
      </div>
    </div>
  );
};

const Catalogo = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [misFavoritosId, setMisFavoritosId] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [gruposDisponibles, setGruposDisponibles] = useState([]); 
  const [vistaActual, setVistaActual] = useState('todos'); 
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [musculosSeleccionados, setMusculosSeleccionados] = useState([]);

  useEffect(() => {
    let unmounted = false;
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const arrEjercicios = await obtenerEjercicios('');
        const arrFavoritos = await obtenerFavoritos();
        
        if (!unmounted) {
          setEjercicios(arrEjercicios);
          setMisFavoritosId(arrFavoritos.map(fav => fav.id_ejercicio));

          const gruposUnicos = new Set();
          arrEjercicios.forEach(ej => {
            if (ej.grupo_muscular) {
              ej.grupo_muscular.split(',').forEach(g => {
                 const limpiarG = g.trim();
                 if (limpiarG) gruposUnicos.add(limpiarG);              
              });
            }
          });
          setGruposDisponibles(Array.from(gruposUnicos).sort());
        }
      } catch (error) {
        if (!unmounted) setMensaje({ tipo: 'error', texto: error.error || 'Error al cargar datos.' });
      } finally {
        if (!unmounted) setCargando(false);
      }
    };
    cargarDatos();
    return () => { unmounted = true; };
  }, []);

 const handleMarcarFavorito = async (idEjercicio) => {
    try {
      const res = await agregarFavorito(idEjercicio);
      
      if (res.accion === 'eliminado') {
        setMisFavoritosId(misFavoritosId.filter(id => id !== idEjercicio));
        setMensaje({ tipo: 'exito', texto: res.mensaje || 'Eliminado de favoritos' });
      } else {
        setMisFavoritosId([...misFavoritosId, idEjercicio]);
        setMensaje({ tipo: 'exito', texto: res.mensaje || 'Añadido a favoritos ❤️' });
      }

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.error || 'Error al actualizar favoritos' });
    }
  };

  const cerrarToast = () => setMensaje(null);

  const handleAñadirFiltroMusculo = (e) => {
    const musculo = e.target.value;
    if (musculo && !musculosSeleccionados.includes(musculo)) {
      setMusculosSeleccionados([...musculosSeleccionados, musculo]);
    }
    e.target.value = ""; 
  };

  const handleQuitarMusculo = (musculoRemover) => {
    setMusculosSeleccionados(musculosSeleccionados.filter(m => m !== musculoRemover));
  };

  const handleLimpiarFiltros = () => {
    setTextoBusqueda('');
    setMusculosSeleccionados([]);
  };

  let ejerciciosProcesados = vistaActual === 'todos' 
    ? ejercicios 
    : ejercicios.filter(ej => misFavoritosId.includes(ej.id_ejercicio));

  if (textoBusqueda.trim() !== '') {
    const txt = textoBusqueda.toLowerCase();
    ejerciciosProcesados = ejerciciosProcesados.filter(ej => 
      ej.nombre.toLowerCase().includes(txt)
    );
  }

  if (musculosSeleccionados.length > 0) {
    ejerciciosProcesados = ejerciciosProcesados.filter(ej => {
      const musculosEj = ej.grupo_muscular ? ej.grupo_muscular.split(',').map(m => m.trim()) : [];
      return musculosSeleccionados.some(filtro => musculosEj.includes(filtro));
    });
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 flex flex-col">
      {/* Componente Toast Renderizado Globalmente */}
      <Toast mensaje={mensaje} onClose={cerrarToast} />

      <div className="max-w-6xl mx-auto w-full">
         <h1 className="text-3xl font-bold text-gray-800 mb-6">Catálogo de Ejercicios</h1>

        <div className="flex bg-gray-200 rounded-lg p-1 w-max mb-6">
          <button onClick={() => setVistaActual('todos')} className={`px-4 py-2 font-medium rounded-md transition ${vistaActual === 'todos' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            Todos los ejercicios
          </button>
          <button onClick={() => setVistaActual('favoritos')} className={`px-4 py-2 font-medium rounded-md transition flex items-center gap-1 ${vistaActual === 'favoritos' ? 'bg-white shadow text-red-500' : 'text-gray-600 hover:text-gray-900'}`}>
            Mis Favoritos ❤️
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text" placeholder="Buscar por nombre..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)}
              />
            </div>
            <div className="md:w-1/3">
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 outline-none" onChange={handleAñadirFiltroMusculo} defaultValue="">
                <option value="" disabled>Añadir filtro de músculo</option>
                {gruposDisponibles.map(grupo => (
                  <option key={grupo} value={grupo} disabled={musculosSeleccionados.includes(grupo)}>{grupo}</option>
                ))}
              </select>
            </div>
            {(textoBusqueda || musculosSeleccionados.length > 0) && (
              <button onClick={handleLimpiarFiltros} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition font-medium whitespace-nowrap">
                Limpiar filtros
              </button>
            )}
          </div>
          {musculosSeleccionados.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm py-1">Filtrando por:</span>
              {musculosSeleccionados.map(m => (
                <span key={m} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  {m} <button onClick={() => handleQuitarMusculo(m)} className="hover:text-red-300 ml-1 font-bold">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {cargando ? (
          <p className="text-center text-gray-500">Cargando catálogo...</p>
        ) : ejerciciosProcesados.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No se encontraron ejercicios con esos filtros.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {ejerciciosProcesados.map((ejercicio) => (
              <TarjetaEjercicio 
                key={ejercicio.id_ejercicio} 
                ejercicio={ejercicio} 
                esFavorito={misFavoritosId.includes(ejercicio.id_ejercicio)} 
                handleMarcarFavorito={handleMarcarFavorito} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;