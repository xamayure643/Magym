import { useState, useContext } from 'react';
import { registrarUsuario, verificarCodigoSms } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const Registro = () => {
    const [paso, setPaso] = useState(1);
    const { login } = useContext(AuthContext); // Extraemos la función de login del contexto
    
    // Todos los campos sincronizados con el Backend
    const [formData, setFormData] = useState({
        nombre: '', correo: '', contrasena: '', telefono: '', 
        peso: '', altura: '', genero: '', frecuencia_entrenamiento: '', objetivo: ''
    });
    
    const [codigoSms, setCodigoSms] = useState('');
    const [loading, setLoading] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorVerificacion, setErrorVerificacion] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: null });
    };

    const handleSiguientePaso = (e) => {
        e.preventDefault();
        setPaso(2);
    };

    // --- SUBMIT FINAL A LA API ---
    const handleSubmitRegistro = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrores({});

        try {
            await registrarUsuario(formData);
            setPaso(3); // Vamos al SMS
        } catch (errorBackend) {
            setErrores(errorBackend);
            if (errorBackend.nombre || errorBackend.correo || errorBackend.contrasena || errorBackend.telefono) {
                setPaso(1); // Volver al inicio si fallan las credenciales
            }
        } finally {
            setLoading(false);
        }
    };

    // --- VERIFICACIÓN SMS CON AUTO-LOGIN ---
    const handleVerificacion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorVerificacion(''); 
        
        try {
            // El backend ahora devuelve los tokens (access y refresh) junto con el mensaje
            const respuesta = await verificarCodigoSms(formData.correo, codigoSms);
            
            // Disparamos el login pasando la respuesta. 
            // El AuthContext mapeará los tokens y nos redirigirá automáticamente a '/catalogo'
            login(respuesta);
            
        } catch (errorBackend) {
            setErrorVerificacion(errorBackend.error || "Error al verificar el código");
        } finally {
            setLoading(false);
        }
    };

    // Función auxiliar simple para evitar el error de renderizado de ESLint
    const renderError = (name) => {
        return errores[name] ? (
            <span className="text-red-500 text-xs font-semibold mt-1">
                {errores[name][0] || errores[name]}
            </span>
        ) : null;
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-8 border border-gray-700">
                
                {/* Indicador de pasos (Wizard) */}
                <div className="flex justify-between items-center mb-8">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className={`flex items-center ${step < 3 ? 'w-full' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${paso >= step ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-700 text-gray-400'}`}>
                                {step}
                            </div>
                            {step < 3 && (
                                <div className={`h-1 flex-1 mx-2 rounded-full ${paso > step ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* PASO 1: CREDENCIALES */}
                {paso === 1 && (
                    <form onSubmit={handleSiguientePaso} className="space-y-4">
                        <h2 className="text-2xl font-bold text-white text-center mb-6">Tus Credenciales</h2>
                        
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Nombre Completo</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required 
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                            {renderError('nombre')}
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Correo Electrónico</label>
                            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required 
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                            {renderError('correo')}
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Contraseña</label>
                            <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="Mín. 8 caracteres, mayúscula, número, especial"
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                            {renderError('contrasena')}
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Teléfono (Para SMS)</label>
                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="+34"
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                            {renderError('telefono')}
                        </div>
                        
                        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg mt-6">
                            Siguiente Paso ➔
                        </button>
                    </form>
                )}

                {/* PASO 2: BIOMETRÍA Y OBJETIVOS */}
                {paso === 2 && (
                    <form onSubmit={handleSubmitRegistro} className="space-y-4">
                        <h2 className="text-2xl font-bold text-white text-center mb-6">Tu Físico y Objetivos</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">Peso (kg)</label>
                                <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} required 
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                {renderError('peso')}
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">Altura (m)</label>
                                <input type="number" step="0.01" name="altura" value={formData.altura} onChange={handleChange} required 
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                {renderError('altura')}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">Género</label>
                                <select name="genero" value={formData.genero} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Selecciona...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {renderError('genero')}
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">Días de entreno</label>
                                <input type="number" name="frecuencia_entrenamiento" min="1" max="7" value={formData.frecuencia_entrenamiento} onChange={handleChange} required placeholder="1 a 7"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                {renderError('frecuencia_entrenamiento')}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Objetivo principal</label>
                            <select name="objetivo" value={formData.objetivo} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Selecciona...</option>
                                <option value="Ganar músculo">Ganar músculo</option>
                                <option value="Perder grasa">Perder grasa</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                            </select>
                            {renderError('objetivo')}
                        </div>

                        {errores.general && <div className="text-red-500 text-sm text-center">{errores.general}</div>}

                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setPaso(1)} className="w-1/3 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition">
                                Atrás
                            </button>
                            <button type="submit" disabled={loading} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg flex justify-center">
                                {loading ? 'Enviando...' : 'Crear Cuenta ➔'}
                            </button>
                        </div>
                    </form>
                )}

                {/* PASO 3: VERIFICACIÓN SMS */}
                {paso === 3 && (
                    <form onSubmit={handleVerificacion} className="space-y-4">
                        <h2 className="text-2xl font-bold text-white text-center mb-2">Verifica tu Teléfono</h2>
                        <p className="text-gray-400 text-sm text-center mb-6">Hemos enviado un código SMS de 6 dígitos a <span className="font-bold text-white">{formData.telefono}</span>.</p>
                        
                        <div>
                            <input type="text" name="codigoSms" value={codigoSms} onChange={(e) => setCodigoSms(e.target.value)} required placeholder="123456" maxLength={6}
                                className="w-full px-4 py-4 text-center tracking-[0.5em] text-2xl rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        {errorVerificacion && <div className="text-red-500 text-sm font-semibold text-center">{errorVerificacion}</div>}

                        <button type="submit" disabled={loading || codigoSms.length < 6} className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition shadow-lg">
                            {loading ? 'Comprobando...' : 'Confirmar Identidad y Acceder'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Registro;