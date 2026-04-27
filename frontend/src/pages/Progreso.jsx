import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { obtenerRutinas, obtenerProgreso, guardarProgreso } from '../services/api';

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

const Progreso = () => {
  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [fecha, setFecha] = useState(new Date());
  const [registroDia, setRegistroDia] = useState({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const datos = await obtenerRutinas();
        setRutinas(datos);
      } catch {
        setMensaje({ tipo: 'error', texto: "Error al descargar tus rutinas." });
      } finally {
        setCargando(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!rutinaSeleccionada) return;

    let unmounted = false;
    const cargarDia = async () => {
      const offset = fecha.getTimezoneOffset() * 60000;
      const fechaLocal = new Date(fecha.getTime() - offset);
      const fechaStr = fechaLocal.toISOString().split('T')[0];
      
      try {
        const bdRegistros = await obtenerProgreso(fechaStr);
        if (unmounted) return;

        let estadoInicial = {};
        rutinaSeleccionada.ejercicios.forEach(ej => {
          const existente = bdRegistros.find(r => r.id_ejercicio === ej.id_ejercicio);
          if (existente && existente.num_series > 0) {
            estadoInicial[ej.id_ejercicio] = {
              num_series: existente.num_series,
              detalles_series: existente.detalles_series || []
            };
          } else {
            estadoInicial[ej.id_ejercicio] = { num_series: 0, detalles_series: [] };
          }
        });
        setRegistroDia(estadoInicial);
      } catch {
        if (!unmounted) setMensaje({ tipo: 'error', texto: "Error al visualizar el entrenamiento de este día." });
      }
    };

    cargarDia();
    return () => { unmounted = true; };
  }, [rutinaSeleccionada, fecha]);

  const cambiarNumSeries = (idEjercicio, incremento) => {
    setRegistroDia(prev => {
      const datosEj = { ...prev[idEjercicio] };
      const nuevoNum = datosEj.num_series + incremento;
      
      if (nuevoNum < 0) return prev; 
      
      datosEj.num_series = nuevoNum;
      
      if (incremento > 0) {
        datosEj.detalles_series = [...datosEj.detalles_series, { reps: "", peso: "" }];
      } else if (incremento < 0) {
        datosEj.detalles_series = datosEj.detalles_series.slice(0, -1);
      }

      return { ...prev, [idEjercicio]: datosEj };
    });
  };

  const editarSerie = (idEjercicio, indexSerie, campo, valor) => {
    setRegistroDia(prev => {
      const datosEj = { ...prev[idEjercicio] };
      const seriesActualizadas = [...datosEj.detalles_series];
      
      seriesActualizadas[indexSerie] = { ...seriesActualizadas[indexSerie], [campo]: Number(valor) || 0 };
      datosEj.detalles_series = seriesActualizadas;
      
      return { ...prev, [idEjercicio]: datosEj };
    });
  };

  const guardarDia = async () => {
    const offset = fecha.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(fecha.getTime() - offset);
    const fechaStr = fechaLocal.toISOString().split('T')[0];
    
    const payload = Object.keys(registroDia).map(idEj => ({
      id_ejercicio: Number(idEj),
      fecha: fechaStr,
      num_series: registroDia[idEj].num_series,
      detalles_series: registroDia[idEj].detalles_series
    }));

    try {
      await guardarProgreso(payload);
      setMensaje({ tipo: 'exito', texto: `¡Progreso guardado correctamente para el ${fechaStr}! 🎉` });
    } catch {
      setMensaje({ tipo: 'error', texto: "Ocurrió un error inesperado al guardar." });
    }
  };

  return (
    <div className="p-4 md:p-8 md:pt-8 pt-20 transition-colors duration-300">
      <Toast mensaje={mensaje} onClose={() => setMensaje(null)} />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* PARTE IZQUIERDA: Selector y Calendario */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl transition-colors">
             <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">1. Selecciona Rutina</label>
             {cargando ? <p className="text-gray-400 dark:text-zinc-500 font-medium">Buscando rutinas...</p> : (
               <select 
                 className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                 onChange={(e) => {
                    const r = rutinas.find(x => x.id_rutina === Number(e.target.value));
                    setRutinaSeleccionada(r);
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>Elige tu entrenamiento...</option>
                 {rutinas.map(r => (
                   <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>
                 ))}
               </select>
             )}
          </div>

          <div className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl transition-all ${rutinaSeleccionada ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
             <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-4">2. Selecciona el Día</label>
             
             <div className="rounded-xl overflow-hidden font-medium text-sm text-gray-900 dark:text-black">
                 <Calendar onChange={setFecha} value={fecha} className="border-none w-full" />
             </div>
             
             <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 text-center transition-colors">
                 <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Registrando: </span>
                 <span className="font-bold text-blue-600 dark:text-blue-400">{fecha.toLocaleDateString()}</span>
             </div>
          </div>
        </div>

        {/* PARTE DERECHA: Formulario */}
        <div className="w-full md:w-2/3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl transition-colors">
          {!rutinaSeleccionada ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500 space-y-4">
                <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span className="font-medium text-sm tracking-wide">Selecciona una rutina a la izquierda para empezar a registrar.</span>
             </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
                 <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{rutinaSeleccionada.nombre}</h1>
                    <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1 font-medium">Anota tus marcas de hoy</p>
                 </div>
                 
                 <button onClick={guardarDia} className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Guardar
                 </button>
              </div>

              <div className="flex flex-col gap-6">
                {rutinaSeleccionada.ejercicios.map((ej) => {
                  const estadoActual = registroDia[ej.id_ejercicio] || { num_series: 0, detalles_series: [] };
                  
                  return (
                    <div key={ej.id_ejercicio} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-inner transition-colors">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        
                        <div className="flex items-center gap-4">
                           {ej.imagen_url ? (
                               <img src={ej.imagen_url} alt="img" className="w-14 h-14 object-cover rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800"/>
                           ) : (
                               <div className="w-14 h-14 bg-gray-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-zinc-600">
                                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
                               </div>
                           )}
                           <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-wide">{ej.nombre}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-xl">
                           <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest pl-2">Series</span>
                           <button onClick={() => cambiarNumSeries(ej.id_ejercicio, -1)} className="text-red-500 dark:text-red-400 font-extrabold w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">-</button>
                           <span className="font-bold text-gray-900 dark:text-zinc-100 w-4 text-center">{estadoActual.num_series}</span>
                           <button onClick={() => cambiarNumSeries(ej.id_ejercicio, 1)} className="text-blue-600 dark:text-blue-400 font-extrabold w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">+</button>
                        </div>

                      </div>

                      {estadoActual.num_series > 0 && (
                        <div className="mt-5 space-y-3">
                           {estadoActual.detalles_series.map((detalle, idx) => (
                             <div key={idx} className="flex gap-4 items-center bg-white/50 dark:bg-zinc-900/50 p-2 rounded-xl border border-gray-200 dark:border-zinc-800/50 transition-colors">
                                <span className="font-black text-gray-400 dark:text-zinc-600 w-8 text-center text-sm">{idx + 1}</span>
                                
                                <div className="flex-1 flex justify-center items-center gap-2">
                                  <input 
                                    type="number" placeholder="0" min="0"
                                    value={detalle.reps}
                                    onChange={(e) => editarSerie(ej.id_ejercicio, idx, "reps", e.target.value)}
                                    className="w-16 p-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-center font-bold text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                  />
                                  <span className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Reps</span>
                                </div>

                                <div className="flex-1 flex justify-center items-center gap-2">
                                  <input 
                                    type="number" placeholder="0.0" min="0" step="0.5"
                                    value={detalle.peso}
                                    onChange={(e) => editarSerie(ej.id_ejercicio, idx, "peso", e.target.value)}
                                    className="w-20 p-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-center font-bold text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                  />
                                  <span className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Kg</span>
                                </div>

                             </div>
                           ))}
                        </div>
                      )}
                      {estadoActual.num_series === 0 && (
                        <p className="text-sm font-medium text-gray-400 dark:text-zinc-600 italic text-center py-4 rounded-xl border border-dashed border-gray-300 dark:border-zinc-800/60 mt-2">Usa el botón '+' para añadir series y registrar tus levantamientos.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Progreso;