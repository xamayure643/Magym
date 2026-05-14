import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://alejandro.integramarketingdigital.es/api';

const api = axios.create({
    baseURL: `${API_BASE_URL}/usuarios`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const registrarUsuario = async (datosUsuario) => {
    try {
        const response = await api.post('/registro/', datosUsuario);
        return response.data;
    } catch (error) {
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

const apiEntrenamientos = axios.create({
    baseURL: `${API_BASE_URL}/entrenamientos`,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiEntrenamientos.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const obtenerEjercicios = async (grupoMuscular = '') => {
    try {
        const params = grupoMuscular ? { grupo_muscular__icontains: grupoMuscular } : {};
        const response = await apiEntrenamientos.get('/ejercicios/', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al obtener catálogo" };
    }
};

export const obtenerFavoritos = async () => {
    try {
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
        return true; 
    }
};

export const obtenerPerfil = async () => {
    try {
        const token = localStorage.getItem('access');
        const response = await api.get('/perfil/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al cargar perfil" };
    }
};

export const actualizarPerfil = async (datos) => {
    try {
        const token = localStorage.getItem('access');
        const response = await api.patch('/perfil/', datos, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al actualizar perfil" };
    }
};


// --- RUTINAS ---
export const obtenerRutinas = async () => {
    try {
        const response = await apiEntrenamientos.get('/rutinas/');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al obtener rutinas" };
    }
};

export const crearRutina = async (datosRutina) => {
    try {
        const response = await apiEntrenamientos.post('/rutinas/', datosRutina);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al crear rutina" };
    }
};

export const actualizarRutina = async (idRutina, datosRutina) => {
    try {
        const response = await apiEntrenamientos.put(`/rutinas/${idRutina}/`, datosRutina);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al actualizar rutina" };
    }
};

export const eliminarRutina = async (idRutina) => {
    try {
        const response = await apiEntrenamientos.delete(`/rutinas/${idRutina}/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al eliminar rutina" };
    }
};

// --- PROGRESO (Registros de Calendario) ---
const apiProgreso = axios.create({
    baseURL: `${API_BASE_URL}/progreso`,
    headers: { 'Content-Type': 'application/json' }
});

apiProgreso.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const obtenerProgreso = async (fecha) => {
    try {
        const response = await apiProgreso.get(`/registros/?fecha=${fecha}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al cargar el progreso del día" };
    }
};

export const obtenerTodoProgreso = async () => {
    try {
        const response = await apiProgreso.get('/registros/');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al cargar el historial" };
    }
};

export const guardarProgreso = async (datosProgresoArray) => {
    try {
        const response = await apiProgreso.post('/registros/', datosProgresoArray);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al guardar el progreso" };
    }
};

// --- NUTRICION ---
const apiNutricion = axios.create({
    baseURL: `${API_BASE_URL}/nutricion`,
    headers: { 'Content-Type': 'application/json' }
});

apiNutricion.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const buscarAlimentos = async (query = '') => {
    try {
        const response = await apiNutricion.get(`/alimentos/?nombre__icontains=${query}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error buscando alimentos" };
    }
};

export const obtenerNutricionHoy = async (fecha) => {
    try {
        // Obtenemos todos los registros del día
        const responseRegistros = await apiNutricion.get(`/registros/?fecha=${fecha}`);
        // Obtenemos los totales del día
        const responseTotales = await apiNutricion.get(`/registros/hoy/?fecha=${fecha}`);
        
        return {
            registros: responseRegistros.data,
            totales: responseTotales.data.totales
        };
    } catch (error) {
        throw error.response?.data || { error: "Error al cargar nutrición" };
    }
};

export const registrarAlimento = async (datosNutricion) => {
    try {
        const response = await apiNutricion.post('/registros/', datosNutricion);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al guardar el alimento" };
    }
};

export const eliminarRegistroAlimento = async (idRegistro) => {
    try {
        const response = await apiNutricion.delete(`/registros/${idRegistro}/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al borrar el registro" };
    }
};