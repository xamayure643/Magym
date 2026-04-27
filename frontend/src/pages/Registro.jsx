import { useState, useContext } from 'react';
import { registrarUsuario, verificarCodigoSms } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Registro = () => {
    const [paso, setPaso] = useState(1);
    const { login } = useContext(AuthContext);
    
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

    const handleSubmitRegistro = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrores({});

        try {
            await registrarUsuario(formData);
            setPaso(3);
        } catch (errorBackend) {
            setErrores(errorBackend);
            if (errorBackend.nombre || errorBackend.correo || errorBackend.contrasena || errorBackend.telefono) {
                setPaso(1);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerificacion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorVerificacion(''); 
        
        try {
            const respuesta = await verificarCodigoSms(formData.correo, codigoSms);
            login(respuesta);
        } catch (errorBackend) {
            setErrorVerificacion(errorBackend.error || "Error al verificar el código");
        } finally {
            setLoading(false);
        }
    };

    const renderError = (name) => {
        return errores[name] ? (
            <span className="text-red-500 text-xs font-semibold mt-1 block">
                {errores[name][0] || errores[name]}
            </span>
        ) : null;
    };

    const inputClasses = "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
    const labelClasses = "block text-gray-700 dark:text-zinc-300 text-sm font-semibold mb-1";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-zinc-800 transition-colors duration-300">
                
                {/* Wizard */}
                <div className="flex justify-between items-center mb-8">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className={`flex items-center ${step < 3 ? 'w-full' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${paso >= step ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'}`}>
                                {step}
                            </div>
                            {step < 3 && (
                                <div className={`h-1 flex-1 mx-2 rounded-full transition-colors ${paso > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-800'}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* PASO 1 */}
                {paso === 1 && (
                    <form onSubmit={handleSiguientePaso} className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-6 tracking-tight">Tus Credenciales</h2>
                        
                        <div>
                            <label className={labelClasses}>Nombre Completo</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className={inputClasses} />
                            {renderError('nombre')}
                        </div>
                        <div>
                            <label className={labelClasses}>Correo Electrónico</label>
                            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className={inputClasses} />
                            {renderError('correo')}
                        </div>
                        <div>
                            <label className={labelClasses}>Contraseña</label>
                            <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="Mín. 8 caracteres" className={inputClasses} />
                            {renderError('contrasena')}
                        </div>
                        <div>
                            <label className={labelClasses}>Teléfono (Para SMS)</label>
                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="+34" className={inputClasses} />
                            {renderError('telefono')}
                        </div>
                        
                        <button type="submit" className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            Siguiente Paso ➔
                        </button>

                        <div className="mt-4 text-center">
                            <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 font-bold transition-colors">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </form>
                )}

                {/* PASO 2 */}
                {paso === 2 && (
                    <form onSubmit={handleSubmitRegistro} className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-6 tracking-tight">Tu Físico y Objetivos</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Peso (kg)</label>
                                <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} required className={inputClasses} />
                                {renderError('peso')}
                            </div>
                            <div>
                                <label className={labelClasses}>Altura (m)</label>
                                <input type="number" step="0.01" name="altura" value={formData.altura} onChange={handleChange} required className={inputClasses} />
                                {renderError('altura')}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Género</label>
                                <select name="genero" value={formData.genero} onChange={handleChange} required className={inputClasses}>
                                    <option value="">Selecciona...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {renderError('genero')}
                            </div>
                            <div>
                                <label className={labelClasses}>Días de entreno</label>
                                <input type="number" name="frecuencia_entrenamiento" min="1" max="7" value={formData.frecuencia_entrenamiento} onChange={handleChange} required placeholder="1 a 7" className={inputClasses} />
                                {renderError('frecuencia_entrenamiento')}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Objetivo principal</label>
                            <select name="objetivo" value={formData.objetivo} onChange={handleChange} required className={inputClasses}>
                                <option value="">Selecciona...</option>
                                <option value="Ganar músculo">Ganar músculo</option>
                                <option value="Perder grasa">Perder grasa</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                            </select>
                            {renderError('objetivo')}
                        </div>

                        {errores.general && <div className="text-red-500 text-sm font-medium text-center">{errores.general}</div>}

                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setPaso(1)} className="w-1/3 py-4 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all">
                                Atrás
                            </button>
                            <button type="submit" disabled={loading} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] flex justify-center">
                                {loading ? 'Enviando...' : 'Crear Cuenta ➔'}
                            </button>
                        </div>
                    </form>
                )}

                {/* PASO 3 */}
                {paso === 3 && (
                    <form onSubmit={handleVerificacion} className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-2 tracking-tight">Verifica tu Teléfono</h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-6 font-medium">Hemos enviado un código SMS de 6 dígitos a <span className="font-bold text-gray-900 dark:text-white">{formData.telefono}</span>.</p>
                        
                        <div>
                            <input type="text" name="codigoSms" value={codigoSms} onChange={(e) => setCodigoSms(e.target.value)} required placeholder="123456" maxLength={6}
                                className="w-full px-4 py-4 text-center tracking-[0.6em] text-2xl font-bold rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>

                        {errorVerificacion && <div className="text-red-500 text-sm font-bold text-center mt-2">{errorVerificacion}</div>}

                        <button type="submit" disabled={loading || codigoSms.length < 6} className="w-full py-4 mt-6 bg-green-600 hover:bg-green-500 active:scale-95 disabled:bg-gray-400 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500 text-white font-bold rounded-xl transition shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                            {loading ? 'Comprobando...' : 'Confirmar Identidad y Acceder'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Registro;