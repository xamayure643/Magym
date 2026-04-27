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
    <div className={`fixed bottom-5 right-5 z-50 flex items-center min-w-[250px] max-w-sm p-4 rounded-xl shadow-2xl border-l-4 transition-all duration-300 transform translate-x-0 ${isError ? 'bg-white dark:bg-zinc-900 border-red-500 text-red-500' : 'bg-white dark:bg-zinc-900 border-green-500 text-green-600 dark:text-green-400'}`}>
      <div className="flex-1 font-bold text-sm tracking-wide">{mensaje.texto}</div>
      <button onClick={onClose} className="ml-4 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 focus:outline-none">
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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border border-gray-200 dark:border-zinc-800 flex flex-col h-full group">
      <div className="h-48 bg-gray-100 dark:bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-gray-200 dark:border-zinc-800 shrink-0">
        {ejercicio.imagen_url ? (
          <ImagenAnimada 
            imagen1={ejercicio.imagen_url} 
            imagen2={ejercicio.imagen_url1} 
            altTexto={ejercicio.nombre} 
          />
        ) : (
          <div className="text-gray-400 dark:text-zinc-600 flex flex-col items-center font-semibold">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="text-sm border border-gray-300 dark:border-zinc-700 px-2 py-1 rounded-lg">Sin imagen</span>
          </div>
        )}
        <button onClick={() => handleMarcarFavorito(ejercicio.id_ejercicio)} className={`absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none ${esFavorito ? 'text-red-500' : 'text-gray-400 dark:text-zinc-500 hover:text-red-400 dark:hover:text-red-400'}`} title={esFavorito ? "En favoritos" : "Añadir a favoritos"}>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">{ejercicio.nombre}</h3>
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {musculosArray.map((musculo, index) => (
            <span key={index} className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
              {musculo}
            </span>
          ))}
        </div>
        
        {/* Descripción */}
        <div className="flex-1 mb-6 flex flex-col justify-start">
            <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium whitespace-pre-wrap leading-relaxed">
              {expandido ? ejercicio.descripcion : descripcionCorta}
            </p>
            {necesitaExpansion && (
              <button 
                onClick={() => setExpandido(!expandido)}
                className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-extrabold mt-3 focus:outline-none self-start flex items-center gap-1 transition-colors"
              >
                {expandido ? "Leer menos ↑" : "Continuar leyendo ↓"}
              </button>
            )}
        </div>
        
        {ejercicio.guia_ejecucion && (
          <a href={ejercicio.guia_ejecucion} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold py-3 rounded-xl transition-all duration-200 mt-auto border border-red-200 dark:border-red-500/30 shrink-0">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            Ver tutorial de ejecución
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
  const [vistaActual, setVistaActual] = useState('todos'); // 'todos' o 'favoritos'
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

  // Lógica de filtrado en cliente
  let ejerciciosFiltrados = ejercicios;

  if (vistaActual === 'favoritos') {
      ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => misFavoritosId.includes(ej.id_ejercicio));
  }

  if (textoBusqueda.trim() !== '') {
      const b = textoBusqueda.toLowerCase();
      ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => ej.nombre.toLowerCase().includes(b));
  }

  if (musculosSeleccionados.length > 0) {
      ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => {
          if (!ej.grupo_muscular) return false;
          const musculosDeEsteEj = ej.grupo_muscular.split(',').map(x => x.trim());
          return musculosSeleccionados.every(filtro => musculosDeEsteEj.includes(filtro));
      });
  }

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 transition-colors duration-300">
      <Toast mensaje={mensaje} onClose={cerrarToast} />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {vistaActual === 'todos' ? 'Explorar Ejercicios' : 'Favoritos'}
            </h1>

            <div className="flex bg-gray-200 dark:bg-zinc-800 p-1.5 rounded-xl self-start md:self-auto border border-gray-300 dark:border-zinc-700">
              <button 
                onClick={() => setVistaActual('todos')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${vistaActual === 'todos' ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Catálogo
              </button>
              <button 
                onClick={() => setVistaActual('favoritos')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${vistaActual === 'favoritos' ? 'bg-white dark:bg-zinc-900 text-red-500 shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Favoritos
              </button>
            </div>
        </div>

        {/* Panel de Filtros */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 mb-10 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Buscar por nombre</label>
                   <input 
                      type="text" 
                      placeholder="Ej: Press de banca, Sentadilla..." 
                      className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 dark:placeholder-zinc-600"
                      value={textoBusqueda}
                      onChange={e => setTextoBusqueda(e.target.value)}
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Filtrar por Grupo Muscular</label>
                   <select 
                      onChange={handleAñadirFiltroMusculo} 
                      className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      defaultValue=""
                   >
                       <option value="" disabled>Añadir filtro de músculo...</option>
                       {gruposDisponibles.map(g => (
                           <option key={g} value={g} disabled={musculosSeleccionados.includes(g)}>{g}</option>
                       ))}
                   </select>

                   {/* Tags de músculos */}
                   {musculosSeleccionados.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-4">
                        {musculosSeleccionados.map(m => (
                           <span key={m} className="bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 text-sm px-3 py-1.5 rounded-lg flex items-center font-bold border border-blue-200 dark:border-blue-500/30">
                              {m}
                              <button onClick={() => handleQuitarMusculo(m)} className="ml-2 hover:text-red-500 font-extrabold w-4 h-4 rounded-full flex items-center justify-center transition-colors">×</button>
                           </span>
                        ))}
                     </div>
                   )}
                </div>
            </div>

            {(textoBusqueda || musculosSeleccionados.length > 0) && (
              <div className="mt-6 flex justify-end">
                  <button onClick={handleLimpiarFiltros} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-lg transition-colors border border-red-100 dark:border-red-500/20">
                      Limpiar todos los filtros
                  </button>
              </div>
            )}
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 dark:text-zinc-500 font-medium py-10">Cargando biblioteca de ejercicios...</p>
        ) : ejerciciosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-zinc-700 transition-colors">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <p className="text-gray-500 dark:text-zinc-400 font-medium text-lg">No se encontraron ejercicios con los filtros actuales.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ejerciciosFiltrados.map((ej) => (
              <TarjetaEjercicio 
                key={ej.id_ejercicio} 
                ejercicio={ej} 
                esFavorito={misFavoritosId.includes(ej.id_ejercicio)}
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