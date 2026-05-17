export const calcularMetas = (perfil) => {
    if (!perfil || !perfil.peso || !perfil.altura || !perfil.genero) return null;

    const peso = parseFloat(perfil.peso);
    let altura = parseFloat(perfil.altura);
    
    if (altura < 3) altura *= 100; 

    const edadAsumida = 25;
    let bmr = (10 * peso) + (6.25 * altura) - (5 * edadAsumida);
    bmr += (perfil.genero.toLowerCase() === 'femenino' || perfil.genero.toLowerCase() === 'mujer') ? -161 : 5;

    let dias_entreno = parseInt(perfil.frecuencia_entrenamiento || 0);

    if (dias_entreno < 0) dias_entreno = 0;
    if (dias_entreno > 7) dias_entreno = 7;

    let factor = 1.2;
    
    if (dias_entreno === 1 || dias_entreno === 2) {
        factor = 1.375;
    } else if (dias_entreno >= 3 && dias_entreno <= 5) {
        factor = 1.55;
    } else if (dias_entreno === 6) {
        factor = 1.725;
    } else if (dias_entreno === 7) {
        factor = 1.9;
    }

    let tdee = bmr * factor;

    const objetivo = perfil.objetivo?.toLowerCase() || '';
    if (objetivo.includes('perder') || objetivo.includes('grasa')) tdee -= 500;
    else if (objetivo.includes('ganar') || objetivo.includes('musculo')) tdee += 500;

    let proteinas = peso * 2;

    return {
        calorias: Math.round(tdee),
        proteinas: Math.round(proteinas)
    };
};