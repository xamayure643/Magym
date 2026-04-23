import requests
import re
from django.core.management.base import BaseCommand
from entrenamientos.models import Ejercicios

# Diccionario maestro para traducir del anatómico en inglés al español normal
TRADUCCIONES_MUSCULOS = {
    "Anterior deltoid": "Hombros", "Shoulders": "Hombros", "Lateral deltoid": "Hombros",
    "Biceps brachii": "Bíceps", "Biceps": "Bíceps", "Brachialis": "Brazos", "Arms": "Brazos",
    "Latissimus dorsi": "Dorsales", "Lats": "Dorsales", "Back": "Espalda",
    "Trapezius": "Trapecios", "Rhomboid": "Espalda alta",
    "Triceps brachii": "Tríceps", "Triceps": "Tríceps",
    "Pectoralis major": "Pecho", "Chest": "Pecho",
    "Rectus abdominis": "Abdominales", "Abs": "Abdominales", "Obliquus externus abdominis": "Oblicuos",
    "Gluteus maximus": "Glúteos", "Quadriceps femoris": "Cuádriceps", "Quad": "Cuádriceps",
    "Biceps femoris": "Isquiotibiales", "Legs": "Piernas",
    "Gastrocnemius": "Gemelos", "Soleus": "Gemelos", "Calves": "Gemelos",
    "Serratus anterior": "Serrato"
}

def traducir_musculo(nombre_en_ingles):
    for ingles, espanol in TRADUCCIONES_MUSCULOS.items():
        if ingles.lower() in str(nombre_en_ingles).lower():
            return espanol
    return nombre_en_ingles

class Command(BaseCommand):
    help = 'Importa cientos de ejercicios en español, traduciendo grupos musculares a español.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Iniciando escaneo masivo en la API de Wger..."))

        # Inicia desde la página 1 con lotes de 100
        url = "https://wger.de/api/v2/exerciseinfo/?limit=100"
        paginas_leidas = 0
        paginas_maximas = 5 # Importará hasta 500 ejercicios
        
        creados = 0
        omitidos = 0
        limpiar_html = re.compile('<.*?>')

        while url and paginas_leidas < paginas_maximas:
            self.stdout.write(f"Descargando lote {paginas_leidas + 1}...")
            
            try:
                response = requests.get(url, timeout=15)
                response.raise_for_status()
                data = response.json()
                ejercicios_api = data.get('results', [])
                
                # Obtenemos la siguiente página que nos manda la API (paginación)
                url = data.get('next')
                paginas_leidas += 1

                for item in ejercicios_api:
                    try:
                        nombre = ""
                        descripcion_sucia = ""
                        traducciones = item.get('translations', [])

                        # Buscar Español (Language=4)
                        for trans in traducciones:
                            if trans.get('language') == 4:
                                nombre = trans.get('name', '')
                                descripcion_sucia = trans.get('description', '')
                                break
                        
                        # Fallback Inglés (Language=2)
                        if not nombre:
                            for trans in traducciones:
                                if trans.get('language') == 2:
                                    nombre = trans.get('name', '')
                                    descripcion_sucia = trans.get('description', '')
                                    break

                        if not nombre:
                            continue

                        descripcion_limpia = re.sub(limpiar_html, '', descripcion_sucia).strip()

                        # CONSTRUIR MÚSCULOS TRADUCIDOS
                        lista_musculos = []
                        categoria = item.get('category', {})
                        if isinstance(categoria, dict) and categoria.get('name'):
                            lista_musculos.append(traducir_musculo(categoria.get('name')))
                        
                        for musculo in item.get('muscles', []):
                            if isinstance(musculo, dict):
                                n = musculo.get('name_en') or musculo.get('name')
                                if n: lista_musculos.append(traducir_musculo(n))
                                
                        for musculo_sec in item.get('muscles_secondary', []):
                            if isinstance(musculo_sec, dict):
                                n = musculo_sec.get('name_en') or musculo_sec.get('name')
                                if n: lista_musculos.append(traducir_musculo(n))

                        musculos_unicos = list(dict.fromkeys([m for m in lista_musculos if m]))
                        grupo_muscular_unido = ", ".join(musculos_unicos)
                        
                        if not grupo_muscular_unido:
                            grupo_muscular_unido = "General"

                        # VIDEOS: Intenta obtener el MP4 real primero, sino Youtube fallback
                        guia_ejecucion = ""
                        videos = item.get('videos', [])
                        if isinstance(videos, list) and len(videos) > 0:
                            primer_video = videos[0]
                            if isinstance(primer_video, dict) and primer_video.get('url'):
                                guia_ejecucion = primer_video.get('url')

                        if not guia_ejecucion:
                            guia_ejecucion = f"https://www.youtube.com/results?search_query={nombre.replace(' ', '+')}+ejercicio+gym"

                        # GUARDADO
                        ejercicio, created = Ejercicios.objects.get_or_create(
                            nombre=nombre[:100], 
                            defaults={
                                'grupo_muscular': grupo_muscular_unido[:255], 
                                'descripcion': descripcion_limpia,
                                'guia_ejecucion': guia_ejecucion[:255] 
                            }
                        )

                        if created: creados += 1
                        else: omitidos += 1
                            
                    except Exception:
                        pass # Ignorar fallos de un ejercicio corrupto
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error descargando el lote: {e}"))
                break

        self.stdout.write(self.style.SUCCESS(
            f"¡Masacre completada! Se guardaron {creados} ejercicios en ESPAÑOL ({omitidos} ignorados/repetidos)."
        ))