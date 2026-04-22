const API_URL = 'http://localhost:8000/api';

export const registrarUsuario = async (datosUsuario) => {
    try {
        const response = await fetch(`${API_URL}/usuarios/registro/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosUsuario)
        });
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error) {
        throw error;
    }
};

export const verificarCodigoSms = async (correo, codigo) => {
    try {
        const response = await fetch(`${API_URL}/usuarios/verificar-sms/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo, codigo })
        });
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error) {
        throw error;
    }
};