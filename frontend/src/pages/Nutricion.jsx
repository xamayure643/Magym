import React, { useState, useEffect } from 'react';
import { buscarAlimentos, obtenerNutricionHoy, eliminarRegistroAlimento, registrarAlimento, obtenerPerfil } from '../services/api';
import { calcularMetas } from '../utils/calculos';
import ConfirmationModal from '../components/ConfirmationModal';

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

const Nutricion = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const [fecha, setFecha] = useState(todayStr);
    const [queryBusqueda, setQueryBusqueda] = useState('');
    const [resultadosAlimentos, setResultadosAlimentos] = useState([]);
    const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null);
    const [gramos, setGramos] = useState('');
    const [registrosDia, setRegistrosDia] = useState([]);
    const [metaReal, setMetaReal] = useState({ calorias: 2500, proteinas: 150 });
    const [totales, setTotales] = useState({ calorias: 0, proteinas: 0 });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
    const [registroAEliminar, setRegistroAEliminar] = useState(null);

    const cargarDatosDelDia = async () => {
        try {
            setCargando(true);
            const [data, dataPerfil] = await Promise.all([
                obtenerNutricionHoy(fecha),
                obtenerPerfil()
            ]);
            
            const metaCalculada = calcularMetas(dataPerfil);
            if (metaCalculada) {
                setMetaReal(metaCalculada);
            }

            setRegistrosDia(data.registros || []);
            setTotales({
                calorias: parseFloat(data.totales?.calorias || 0),
                proteinas: parseFloat(data.totales?.proteinas || 0)
            });
            setCargando(false);
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.error || 'Error al cargar los datos' });
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatosDelDia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]);

    useEffect(() => {
        const fetchAlimentos = async () => {
            try {
                const results = await buscarAlimentos(queryBusqueda);
                setResultadosAlimentos(results);
            } catch (err) {
                console.error("Error al buscar alimentos", err);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            if (queryBusqueda.length > 2) {
                fetchAlimentos();
            } else {
                setResultadosAlimentos([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [queryBusqueda]);

    const manejarSeleccion = (alimento) => {
        setAlimentoSeleccionado(alimento);
        setQueryBusqueda(alimento.nombre);
        setResultadosAlimentos([]);
    };

    const guardarRegistro = async () => {
        if (!alimentoSeleccionado || !gramos || gramos <= 0) return;
        try {
            await registrarAlimento({
                id_alimento: alimentoSeleccionado.id_alimento,
                cantidad_gramos: gramos,
                fecha: fecha
            });

            setAlimentoSeleccionado(null);
            setQueryBusqueda('');
            setGramos('');
            cargarDatosDelDia();
            setMensaje({ tipo: 'exito', texto: 'Alimento registrado correctamente' });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.error || 'Error al registrar el alimento' });
        }
    };

    const borrarRegistro = (idRegistro) => {
        setRegistroAEliminar(idRegistro);
        setConfirmacionAbierta(true);
    };

    const confirmarEliminacion = async () => {
        try {
            await eliminarRegistroAlimento(registroAEliminar);
            cargarDatosDelDia();
            setConfirmacionAbierta(false);
            setRegistroAEliminar(null);
            setMensaje({ tipo: 'exito', texto: 'Alimento eliminado' });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.error || 'Error al eliminar el alimento' });
            setConfirmacionAbierta(false);
            setRegistroAEliminar(null);
        }
    };

    const colorCalorias = totales.calorias > metaReal.calorias ? 'text-red-500' : 'text-green-500';
    const porcentajeCalorias = Math.min((totales.calorias / metaReal.calorias) * 100, 100) || 0;
    const porcentajeProteinas = Math.min((totales.proteinas / metaReal.proteinas) * 100, 100) || 0;

    return (
        <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 bg-gray-50 dark:bg-zinc-950 min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <Toast mensaje={mensaje} onClose={() => setMensaje(null)} />
            
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrición</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Controla tus macros diarios</p>
                </div>
                <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 rounded-lg text-sm"
                />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Añadir Alimento</h2>
                    
                    <div className="space-y-4 relative">
                        <div>
                            <label className="block text-sm font-medium mb-1">Buscar alimento</label>
                            <input
                                type="text"
                                placeholder="Ej: Pollo, avena..."
                                value={queryBusqueda}
                                onChange={(e) => setQueryBusqueda(e.target.value)}
                                className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 rounded-lg outline-none"
                            />
                            {resultadosAlimentos.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {resultadosAlimentos.map(alim => (
                                        <li 
                                            key={alim.id_alimento} 
                                            onClick={() => manejarSeleccion(alim)}
                                            className="p-3 hover:bg-green-50 dark:hover:bg-zinc-700 cursor-pointer border-b border-gray-100 dark:border-zinc-700 last:border-b-0 text-sm"
                                        >
                                            <span className="font-semibold">{alim.nombre}</span>
                                            <span className="block text-xs text-gray-500">
                                                {parseFloat(alim.calorias_por_gramo * 100).toFixed(0)} kcal / 100g
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {alimentoSeleccionado && (
                            <div className="flex items-end gap-4 animate-fade-in-up">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Catidad (Gramos)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 150"
                                        value={gramos}
                                        onChange={(e) => setGramos(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 rounded-lg outline-none"
                                    />
                                </div>
                                <button
                                    onClick={guardarRegistro}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 h-[46px]"
                                >
                                    Añadir
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-center">
                    <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Resumen Diario</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium text-gray-600 dark:text-gray-400">Calorías</span>
                                <span className={`font-bold ${colorCalorias}`}>
                                    {Math.round(totales.calorias)} / {metaReal.calorias} kcal
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                                <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${totales.calorias > metaReal.calorias ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${porcentajeCalorias}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium text-gray-600 dark:text-gray-400">Proteínas</span>
                                <span className="font-bold text-blue-500">
                                    {Math.round(totales.proteinas)} / {metaReal.proteinas} g
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                                <div 
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${porcentajeProteinas}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Historial ({(registrosDia || []).length})</h3>
                </div>
                {cargando ? (
                    <div className="p-6 text-center text-sm">Cargando...</div>
                ) : (registrosDia || []).length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">Sin registros hoy.</div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {registrosDia.map(reg => (
                            <li key={reg.id_registro} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{reg.alimento_nombre}</p>
                                    <p className="text-xs text-gray-500">{reg.cantidad_gramos}g</p>
                                </div>
                                <div className="text-right text-sm px-4">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{Math.round(reg.calorias_calculadas)} kcal</p>
                                    <p className="text-xs text-blue-500 font-medium">{Math.round(reg.proteinas_calculadas)}g prot.</p>
                                </div>
                                <button
                                    onClick={() => borrarRegistro(reg.id_registro)}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                                >
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmacionAbierta}
                titulo="Eliminar Alimento"
                mensaje="¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer."
                textoConfirmar="Eliminar"
                textoCancel="Cancelar"
                onConfirm={confirmarEliminacion}
                onCancel={() => {
                    setConfirmacionAbierta(false);
                    setRegistroAEliminar(null);
                }}
                isDangerous={true}
            />
        </div>
    );
};

export default Nutricion;