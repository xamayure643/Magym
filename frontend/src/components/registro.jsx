import { useState } from 'react';
import { registrarUsuario, verificarCodigoSms } from '../services/api';
import './Registro.css'; 

const Registro = () => {
    const [paso, setPaso] = useState(1);
    
    const [formData, setFormData] = useState({
        nombre: '', correo: '', contrasena: '', telefono: '', peso: '', altura: ''
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

    // --- FASE 1: REGISTRO ---
    const handleSubmitRegistro = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrores({});

        try {
            await registrarUsuario(formData);
            setPaso(2); // Pasamos a la pantalla de validación
        } catch (errorBackend) {
            setErrores(errorBackend);
        } finally {
            setLoading(false);
        }
    };

    // --- FASE 2: VERIFICACIÓN REAL ---
    const handleVerificacion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorVerificacion(''); 
        
        try {
            const respuesta = await verificarCodigoSms(formData.correo, codigoSms);
            alert("¡Identidad verificada! " + respuesta.mensaje);
            
            // LIMPIEZA TOTAL: Reseteamos el formulario al estado inicial
            setPaso(1);
            setFormData({ nombre: '', correo: '', contrasena: '', telefono: '', peso: '', altura: '' });
            setCodigoSms('');
            
        } catch (errorBackend) {
            setErrorVerificacion(errorBackend.error || "Error al verificar el código");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="magym-container">
            <div className="magym-card">
                
                {paso === 1 && (
                    <>
                        <h2 className="magym-title">Únete a MAGYM</h2>
                        <form onSubmit={handleSubmitRegistro}>
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input type="text" name="nombre" className="magym-input" value={formData.nombre} onChange={handleChange} required />
                                {errores.nombre && <span className="error-text">{errores.nombre[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" name="correo" className="magym-input" value={formData.correo} onChange={handleChange} required />
                                {errores.correo && <span className="error-text">{errores.correo[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label>Contraseña Segura</label>
                                <input type="password" name="contrasena" className="magym-input" value={formData.contrasena} onChange={handleChange} required placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número..." />
                                {errores.contrasena && <span className="error-text">{errores.contrasena[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label>Teléfono (Validación SMS)</label>
                                <input type="tel" name="telefono" className="magym-input" value={formData.telefono} onChange={handleChange} required placeholder="+34 600 000 000" />
                                {errores.telefono && <span className="error-text">{errores.telefono[0]}</span>}
                            </div>

                            <div className="biometria-grid">
                                <div className="form-group">
                                    <label>Peso (kg)</label>
                                    <input type="number" step="0.1" name="peso" className="magym-input" value={formData.peso} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Altura (m)</label>
                                    <input type="number" step="0.01" name="altura" className="magym-input" value={formData.altura} onChange={handleChange} required />
                                </div>
                            </div>

                            {errores.error && <div className="error-text" style={{textAlign: 'center'}}>{errores.error}</div>}

                            <button type="submit" className="magym-button" disabled={loading}>
                                {loading ? 'Cifrando datos...' : 'Crear Cuenta'}
                            </button>
                        </form>
                    </>
                )}

                {paso === 2 && (
                    <div className="verificacion-container">
                        <div className="verificacion-icono">📱</div>
                        <h2 className="magym-title">Verificación de Identidad</h2>
                        <p style={{ color: '#b3b3b3', marginBottom: '25px', fontSize: '14px' }}>
                            Hemos enviado un código SMS al número terminado en <strong>{formData.telefono.slice(-4)}</strong>. 
                        </p>
                        
                        <form onSubmit={handleVerificacion}>
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    className="magym-input" 
                                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} 
                                    maxLength="6"
                                    placeholder="000000"
                                    value={codigoSms}
                                    onChange={(e) => setCodigoSms(e.target.value.replace(/\D/g, ''))} 
                                    required 
                                />
                            </div>
                            
                            {errorVerificacion && <div className="error-text" style={{marginBottom: '15px'}}>{errorVerificacion}</div>}

                            <button type="submit" className="magym-button" disabled={loading || codigoSms.length < 6}>
                                {loading ? 'Verificando...' : 'Confirmar Identidad'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Registro;