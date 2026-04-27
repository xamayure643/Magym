import React, { useState, useEffect } from 'react';
import { obtenerRutinas, crearRutina, actualizarRutina, eliminarRutina, obtenerEjercicios } from '../services/api';

const Rutinas = () => {
  const [rutinas, setRutinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados generales del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rutinaEditando, setRutinaEditando] = useState(null);
  const [nombreRutina, setNombreRutina] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // Ejercicios
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);

  // Estados interactivos para Drag & Drop
  const [dragStartIdx, setDragStartIdx] = useState(null);
  const [dragEnterIdx, setDragEnterIdx] = useState(null);

  useEffect(() => {
    let unmounted = false;
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const resRutinas = await obtenerRutinas();
        const resEjercicios = await obtenerEjercicios('');
        if (!unmounted) {
          setRutinas(resRutinas);
          setEjerciciosDisponibles(resEjercicios);
        }
      } catch (err) {
        console.error("Error cargando rutinas", err);
      } finally {
        if (!unmounted) setCargando(false);
      }
    };
    
    cargarDatos();
    return () => { unmounted = true; };
  }, []);

  // --- ACTIONS: Rutinas ---
  const handleEliminar = async (idRutina) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta rutina?")) return;
    try {
      await eliminarRutina(idRutina);
      setRutinas(prev => prev.filter(r => r.id_rutina !== idRutina));
    } catch { 
      alert("Error al eliminar"); 
    }
  };

  const abrirModalCrear = () => {
    setRutinaEditando(null);
    setNombreRutina('');
    setEjerciciosSeleccionados([]);
    setBusqueda('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (rutina) => {
    setRutinaEditando(rutina.id_rutina);
    setNombreRutina(rutina.nombre);
    // Clonamos los ejercicios para no mutar el state original hasta guardar
    setEjerciciosSeleccionados([...(rutina.ejercicios || [])]);
    setBusqueda('');
    setModalAbierto(true);
  };

  const handleGuardarRutina = async () => {
    if (!nombreRutina) return alert("Ponle un nombre a la rutina.");
    if (ejerciciosSeleccionados.length === 0) return alert("Añade al menos un ejercicio.");

    const payload = {
      nombre: nombreRutina,
      ejercicios: ejerciciosSeleccionados.map((ej, index) => ({
        id_ejercicio: ej.id_ejercicio,
        orden_ejecucion: index + 1 
      }))
    };

    try {
      if (rutinaEditando) {
        await actualizarRutina(rutinaEditando, payload);
      } else {
        await crearRutina(payload);
      }
      setModalAbierto(false);
      
      // Recargamos los datos para ver los cambios refrescados
      const resRutinas = await obtenerRutinas();
      setRutinas(resRutinas);
    } catch {
      alert("Error al guardar la rutina");
    }
  };

  // --- ACTIONS: Ejercicios del Modal ---
  const handleAgregarEjercicio = (ejercicio) => {
    setEjerciciosSeleccionados([...ejerciciosSeleccionados, ejercicio]);
    setBusqueda(''); 
  };

  const handleQuitarEjercicio = (index) => {
    const nuevos = [...ejerciciosSeleccionados];
    nuevos.splice(index, 1);
    setEjerciciosSeleccionados(nuevos);
  };

  // --- LOGICA DRAG & DROP NATIVA ---
  const handleDragStart = (e, index) => { setDragStartIdx(index); };
  const handleDragEnter = (e, index) => { setDragEnterIdx(index); };
  const handleDragEnd = () => {
      if (dragStartIdx !== null && dragEnterIdx !== null && dragStartIdx !== dragEnterIdx) {
          const nuevaLista = [...ejerciciosSeleccionados];
          const itemArrastrado = nuevaLista.splice(dragStartIdx, 1)[0];
          nuevaLista.splice(dragEnterIdx, 0, itemArrastrado);
          setEjerciciosSeleccionados(nuevaLista);
      }
      setDragStartIdx(null);
      setDragEnterIdx(null);
  };

  const ejerciciosFiltrados = busqueda.trim() === '' ? [] : ejerciciosDisponibles.filter(ej => 
    ej.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Mis Rutinas</h1>
          <button onClick={abrirModalCrear} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 w-full md:w-auto">
            + Crear Rutina
          </button>
        </div>

        {cargando ? (
          <p className="text-gray-500 dark:text-zinc-500 text-center font-medium mt-10">Cargando rutinas...</p>
        ) : rutinas.length === 0 ? (
          <div className="text-center bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 transition-colors">
            <p className="text-gray-500 dark:text-zinc-400 font-medium mb-4">No tienes ninguna rutina creada aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rutinas.map(rutina => (
              <div key={rutina.id_rutina} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white pr-2 leading-tight">{rutina.nombre}</h3>
                  <div className="flex gap-2 shrink-0 border border-gray-100 dark:border-zinc-800 p-1 rounded-lg bg-gray-50 dark:bg-zinc-950">
                    <button onClick={() => abrirModalEditar(rutina)} className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-bold text-sm px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleEliminar(rutina.id_rutina)} className="text-red-500 dark:text-red-400 hover:text-red-600 font-bold text-xl px-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar Rutina">
                      ×
                    </button>
                  </div>
                </div>
                <div className="space-y-3 mt-4 border-t border-gray-100 dark:border-zinc-800/80 pt-4">
                  {rutina.ejercicios && rutina.ejercicios.map(ej => (
                    <div key={ej.id_ejercicio + '-' + ej.orden_ejecucion} className="flex items-center gap-3 text-sm text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800/50 transition-colors">
                      <span className="font-black text-gray-400 dark:text-zinc-600 w-5 text-center">{ej.orden_ejecucion}</span>
                      {ej.imagen_url ? (
                         <img src={ej.imagen_url} alt="ej" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"/>
                      ) : (
                         <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0"><span className="text-xs text-gray-500">Img</span></div>
                      )}
                      <span className="truncate font-semibold">{ej.nombre}</span>
                    </div>
                  ))}
                  {(!rutina.ejercicios || rutina.ejercicios.length === 0) && (
                    <p className="text-sm text-gray-400 dark:text-zinc-500 italic font-medium p-2 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">Rutina vacía, pulsa Editar.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-950">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{rutinaEditando ? 'Editar Rutina' : '✨ Nueva Rutina'}</h2>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 text-3xl font-light leading-none transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 auto-rows-max flex flex-col gap-8">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Nombre de la rutina</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-zinc-600" 
                  placeholder="Ej: Día 1 - Pecho y Bíceps"
                  value={nombreRutina} onChange={(e) => setNombreRutina(e.target.value)}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Añadir ejercicios</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-zinc-600" 
                  placeholder="Buscar ejercicio por nombre..."
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                />
                
                {ejerciciosFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-2xl rounded-xl max-h-60 overflow-y-auto">
                    {ejerciciosFiltrados.map(ej => (
                      <button 
                        key={ej.id_ejercicio} 
                        onClick={() => handleAgregarEjercicio(ej)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-600/20 text-gray-800 dark:text-zinc-200 font-medium border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-colors flex items-center gap-3"
                      >
                         {ej.imagen_url && <img src={ej.imagen_url} alt="" className="w-8 h-8 rounded-md object-cover border border-gray-200 dark:border-zinc-700" />}
                         {ej.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 uppercase tracking-wide flex justify-between items-end">
                  <span>Lista Activa ({ejerciciosSeleccionados.length})</span>
                  <span className="text-xs text-gray-400 font-medium normal-case">Mantén presionado para ordenar</span>
                </label>
                
                <div className="space-y-2 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl bg-gray-50 dark:bg-zinc-950/50 min-h-[150px]">
                  {ejerciciosSeleccionados.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-zinc-500 italic text-center py-8">Aún no hay ejercicios en tu rutina.</p>
                  ) : (
                    ejerciciosSeleccionados.map((ej, index) => (
                      <div 
                        key={index + '-' + ej.id_ejercicio} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border ${dragEnterIdx === index ? 'border-blue-500 dark:border-blue-500 border-2 border-dashed' : 'border-gray-200 dark:border-zinc-700'} rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-zinc-600 transition-colors`}
                      >
                        <div className="flex items-center gap-4">
                           <div className="text-gray-400 dark:text-zinc-500 cursor-grab px-1" title="Arrastrar para ordenar">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                           </div>
                           <span className="font-black text-gray-400 dark:text-zinc-600 w-5">{index + 1}</span>
                           {ej.imagen_url && <img src={ej.imagen_url} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-zinc-800" />}
                           <span className="font-bold text-gray-900 dark:text-white leading-tight">{ej.nombre}</span>
                        </div>
                        <button 
                          onClick={() => handleQuitarEjercicio(index)} 
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-extrabold text-xl px-3 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex justify-end gap-4 rounded-b-xl">
              <button onClick={() => setModalAbierto(false)} className="px-6 py-3 font-bold px-6 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleGuardarRutina} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95">
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Rutinas;