import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/usuarios',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const registrarUsuario = async (datosUsuario) => {
    try {
        const response = await api.post('/registro/', datosUsuario);
        return response.data;
    } catch (error) {
        // En Axios, los errores del servidor vienen en error.response.data
        throw error.response?.data || { general: "Error de conexión" };
    }
};

export const verificarCodigoSms = async (correo, codigo) => {
    try {
        const response = await api.post('/verificar-sms/', { correo, codigo });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error de conexión" };
    }
};