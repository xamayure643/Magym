import React, { useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { obtenerPerfil, actualizarPerfil } from '../services/api';
import { calcularMetas } from '../utils/calculos';

const Perfil = () => {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const data = await obtenerPerfil();
                setPerfil(data);
                setFormData({
                    peso: data.peso || '',
                    altura: data.altura || '',
                    objetivo: data.objetivo || '',
                    frecuencia_entrenamiento: data.frecuencia_entrenamiento || ''
                });
            } catch (err) {
                setError(err.error || 'Error al cargar perfil');
            } finally {
                setCargando(false);
            }
        };
        fetchPerfil();
    }, []);

    const handleChange = (e) => {
        let value = e.target.value;
        const name = e.target.name;

        if (name === 'frecuencia_entrenamiento') {
            if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 7)) {
                return;
            }
        }
        
        if (name === 'altura' && parseInt(value) > 300) return;
        if (name === 'peso' && parseInt(value) < 0) return;

        setFormData({ ...formData, [name]: value });
    };

    const handleGuardar = async () => {
        try {
            const dataGuardada = await actualizarPerfil(formData);
            setPerfil(dataGuardada);
            setEditando(false);
        } catch (err) {
            setError(err.error || 'Error al actualizar el perfil');
        }
    };

    if (cargando) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const metas = calcularMetas(perfil);

    return (
        <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
                    <p className="text-sm text-gray-500">Tus datos personales y métricas</p>
                </div>
            </header>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
                    <div className="w-24 h-24 flex-shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold">
                        {perfil.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-2xl font-bold">{perfil.nombre}</h2>
                        <p className="text-gray-500">{perfil.correo}</p>
                    </div>
                    <button 
                        onClick={() => editando ? handleGuardar() : setEditando(true)}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
                    >
                        {editando ? 'Guardar Cambios' : 'Editar Datos'}
                    </button>
                    {editando && (
                        <button onClick={() => setEditando(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Cancelar
                        </button>
                    )}
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Datos Físicos y Objetivos</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Peso (kg)</span>
                        {editando ? (
                            <input type="number" name="peso" value={formData.peso} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md outline-none" />
                        ) : (
                            <span className="font-semibold text-lg">{perfil.peso || '---'}</span>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Altura (cm)</span>
                        {editando ? (
                            <input type="number" name="altura" value={formData.altura} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md outline-none" />
                        ) : (
                            <span className="font-semibold text-lg">{perfil.altura || '---'}</span>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Días Entreno (Semana)</span>
                        {editando ? (
                            <input type="number" name="frecuencia_entrenamiento" max="7" min="0" value={formData.frecuencia_entrenamiento} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md outline-none" />
                        ) : (
                            <span className="font-semibold text-lg">{perfil.frecuencia_entrenamiento || '---'}</span>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Objetivo</span>
                        {editando ? (
                            <select name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md outline-none">
                                <option value="">Selecciona...</option>
                                <option value="Ganar músculo">Ganar músculo</option>
                                <option value="Perder grasa">Perder grasa</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                            </select>
                        ) : (
                            <span className="font-semibold text-lg">{perfil.objetivo || '---'}</span>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">Información Personal</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Género</span>
                        <span className="font-semibold text-lg">{perfil.genero || 'No especificado'}</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Teléfono</span>
                        <span className="font-semibold text-lg">{perfil.telefono || 'Sin asignar'}</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Estado de cuenta</span>
                        <div className="flex gap-2 items-center mt-1">
                            <span className={`w-2 h-2 rounded-full ${perfil.cuenta_activa ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span className="font-semibold">{perfil.cuenta_activa ? 'Activa' : 'Pendiente Confirmar'}</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="block text-sm text-gray-500">Miembro desde</span>
                        <span className="font-semibold text-lg">
                            {perfil.fecha_registro ? new Date(perfil.fecha_registro).toLocaleDateString() : '---'}
                        </span>
                    </div>
                </div>

                {metas && !editando && (
                    <div className="mt-8 mb-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white shadow-md">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-3">🎯 Tus Macros Diarios Calculados</h3>
                        <div className="flex justify-between items-center border-t border-white/20 pt-4">
                            <div className="text-center w-1/2 border-r border-white/20">
                                <span className="block text-sm opacity-80 uppercase tracking-widest">Calorías</span>
                                <span className="text-3xl font-extrabold">{metas.calorias}</span>
                            </div>
                            <div className="text-center w-1/2">
                                <span className="block text-sm opacity-80 uppercase tracking-widest">Proteína</span>
                                <span className="text-3xl font-extrabold">{metas.proteinas} g</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Perfil;