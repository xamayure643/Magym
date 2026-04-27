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

// Instancia para el módulo de entrenamientos (con rutas limpias)
const apiEntrenamientos = axios.create({
    baseURL: 'http://localhost:8000/api/entrenamientos',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para inyectar automáticamente el token JWT en las peticiones
apiEntrenamientos.interceptors.request.use((config) => {
    const token = localStorage.getItem('access'); // Asegúrate de que el login guarda el token como 'access'
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const obtenerEjercicios = async (grupoMuscular = '') => {
    try {
        // En vez de: const params = grupoMuscular ? { grupo_muscular: grupoMuscular } : {};
        // Hacemos que coincida con el backend de DRF
        const params = grupoMuscular ? { grupo_muscular__icontains: grupoMuscular } : {};
        const response = await apiEntrenamientos.get('/ejercicios/', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al obtener catálogo" };
    }
};

// frontend/src/services/api.js
export const obtenerFavoritos = async () => {
    try {
        // Quitamos el getAuthHeaders() porque el interceptor de arriba ya manda el token
        const response = await apiEntrenamientos.get('/favoritos/');
        return response.data; 
    } catch (error) {
        throw error.response?.data || { error: "Error de conexión" };
    }
};

export const agregarFavorito = async (id_ejercicio) => {
    try {
        const response = await apiEntrenamientos.post('/favoritos/', { id_ejercicio });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al guardar favorito" };
    }
};

// ... al final de las funciones globales, antes de la apiEntrenamientos ...

export const loginUsuario = async (credenciales) => {
    try {
        const response = await api.post('/login/', credenciales);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error de conexión" };
    }
};

export const logoutUsuario = async (refresh) => {
    try {
        const response = await api.post('/logout/', { refresh });
        return response.data;
    } catch (error) {
        console.warn("Fallo silencioso en el logout del servidor", error);
        // Retornamos true para limpiar frontend incluso si el token expiró en backend
        return true; 
    }
};