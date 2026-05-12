export const calcularMetas = (perfil) => {
    if (!perfil || !perfil.peso || !perfil.altura || !perfil.genero) return null;

    const peso = parseFloat(perfil.peso);
    let altura = parseFloat(perfil.altura);
    
    // CORRECCIÓN: Si el usuario puso 1.80 (metros) en lugar de 180 (cm), lo convertimos a cm para arreglar la fórmula
    if (altura < 3) altura *= 100; 

    // 1. Tasa Metabólica Basal (Mifflin-St Jeor)
    const edadAsumida = 25;
    let bmr = (10 * peso) + (6.25 * altura) - (5 * edadAsumida);
    bmr += (perfil.genero.toLowerCase() === 'femenino' || perfil.genero.toLowerCase() === 'mujer') ? -161 : 5;

        // 2. Factor Actividad (según días a la semana)
    let dias_entreno = parseInt(perfil.frecuencia_entrenamiento || 0);

    // Nos aseguramos de que no pueda usar valores ilógicos en las matemáticas
    if (dias_entreno < 0) dias_entreno = 0;
    if (dias_entreno > 7) dias_entreno = 7;

    let factor = 1.2; // Sedentario por defecto (0 días)
    
    if (dias_entreno === 1 || dias_entreno === 2) {
        factor = 1.375; // Ligero
    } else if (dias_entreno >= 3 && dias_entreno <= 5) {
        factor = 1.55;  // Moderado
    } else if (dias_entreno === 6) {
        factor = 1.725; // Muy activo
    } else if (dias_entreno === 7) {
        factor = 1.9;   // Extremadamente activo (Atleta, 7 días/semana)
    }

    let tdee = bmr * factor;

    // 3. Ajuste por Objetivo
    const objetivo = perfil.objetivo?.toLowerCase() || '';
    if (objetivo.includes('perder') || objetivo.includes('grasa')) tdee -= 500;
    else if (objetivo.includes('ganar') || objetivo.includes('musculo')) tdee += 500;

    // Proteínas diarias (en base enfocada al fitness: aprox 2g por kg de peso corporal)
    let proteinas = peso * 2;

    return {
        calorias: Math.round(tdee),
        proteinas: Math.round(proteinas)
    };
};