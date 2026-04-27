import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { obtenerRutinas, obtenerTodoProgreso } from '../services/api';

const Dashboard = () => {
  const [rutinas, setRutinas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [rutinaElegida, setRutinaElegida] = useState('');
  const [ejercicioElegido, setEjercicioElegido] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState('siempre');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rutinasData, progresoData] = await Promise.all([obtenerRutinas(), obtenerTodoProgreso()]);
        setRutinas(rutinasData);
        setHistorial(progresoData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const ejerciciosDisponibles = useMemo(() => {
    if (!rutinaElegida) return [];
    const rutina = rutinas.find(r => r.id_rutina === Number(rutinaElegida));
    return rutina ? rutina.ejercicios : [];
  }, [rutinaElegida, rutinas]);

  useEffect(() => setEjercicioElegido(''), [rutinaElegida]);

  const datosGrafica = useMemo(() => {
    if (!ejercicioElegido) return [];
    let datosFiltrados = historial.filter(h => h.id_ejercicio === Number(ejercicioElegido));
    const hoy = dayjs();
    
    if (filtroTiempo === 'mes') datosFiltrados = datosFiltrados.filter(h => dayjs(h.fecha).isAfter(hoy.subtract(1, 'month')));
    else if (filtroTiempo === 'anyo') datosFiltrados = datosFiltrados.filter(h => dayjs(h.fecha).isAfter(hoy.subtract(1, 'year')));

    datosFiltrados.sort((a, b) => dayjs(a.fecha).diff(dayjs(b.fecha)));

    return datosFiltrados.map(registro => {
      let pesoMaximo = 0;
      if (registro.detalles_series && registro.detalles_series.length > 0) {
        pesoMaximo = Math.max(...registro.detalles_series.map(s => Number(s.peso) || 0));
      }
      return { fecha: dayjs(registro.fecha).format('DD/MM/YYYY'), pesoM: pesoMaximo };
    });
  }, [ejercicioElegido, historial, filtroTiempo]);

  if (cargando) return <div className="p-8 text-center text-gray-500 font-medium">Cargando métricas...</div>;

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-gray-900 dark:text-white">
          Tus Estadísticas
        </h1>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">1. Elige una Rutina</label>
            <select 
              value={rutinaElegida} onChange={e => setRutinaElegida(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Selecciónalos...</option>
              {rutinas.map(r => (
                <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">2. Elige el Ejercicio</label>
            <select 
              value={ejercicioElegido} onChange={e => setEjercicioElegido(e.target.value)} disabled={!rutinaElegida}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 transition-all"
            >
              <option value="">Selecciónalos...</option>
              {ejerciciosDisponibles.map(ej => (
                <option key={ej.id_ejercicio} value={ej.id_ejercicio}>{ej.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">3. Rango de Tiempo</label>
            <select 
              value={filtroTiempo} onChange={e => setFiltroTiempo(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="mes">Último Mes</option>
              <option value="anyo">Último Año</option>
              <option value="siempre">Desde el principio</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl transition-colors">
          {!rutinaElegida || !ejercicioElegido ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500 space-y-2">
              <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="font-medium text-sm text-center">Filtra arriba para mostrar tu historial de RM</p>
            </div>
          ) : datosGrafica.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 font-medium">
              No hay levantamientos registrados en este periodo.
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center tracking-wide">
                Evolución de Peso Máximo (Kg)
              </h3>
              <div className="h-[350px] text-gray-900 dark:text-white">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGrafica} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis dataKey="fecha" stroke="#a1a1aa" tick={{fontSize: 12}} tickMargin={10} axisLine={false} />
                    <YAxis stroke="#a1a1aa" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value) => [`${value} Kg`, 'Repetición Máxima']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pesoM" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                      activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;