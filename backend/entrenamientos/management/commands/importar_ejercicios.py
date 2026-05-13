import requests #Peticiones API
import time #Para los sleep
from deep_translator import GoogleTranslator #Librería para traducir
from django.core.management.base import BaseCommand #Para crear comandos personalizados
from entrenamientos.models import Ejercicios

#Mapa para las traducciones de las categorías
DICCIONARIO_MUSCULOS = {
    "abdominal": "Abdominales", "adductors": "Aductores", "obliques": "Oblicuos",
    "biceps": "Bíceps", "calves": "Gemelos", "chest": "Pecho", "forearms": "Antebrazos",
    "glutes": "Glúteos", "hamstrings": "Isquiotibiales", "lats": "Dorsales",
    "lower back": "Lumbares", "middle back": "Espalda Media", "neck": "Cuello",
    "quadriceps": "Cuádriceps", "shoulders": "Hombros", "traps": "Trapecios",
    "triceps": "Tríceps", "abductors": "Abductores"
}

class Command(BaseCommand):
    help = 'Puebla la tabla de ejercicios'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Descargando JSON de ejercicios..."))

        #Ejercicios
        url_json = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"

        #Fotos de ejercicios
        base_url_img = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"
        
        try:
            r = requests.get(url_json, timeout=15) #Descargamos el JSON
            r.raise_for_status() #Si no da 200 lanza error
            ejercicios_api = r.json() #Cogemos la lista de ejercicios
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error JSON: {e}"))
            return

        traductor = GoogleTranslator(source='en', target='es')
        creados = 0

        ejercicios_a_procesar = ejercicios_api[:250]

        self.stdout.write(f"Iniciando guardado de {len(ejercicios_a_procesar)} ejercicios...")

        for i, item in enumerate(ejercicios_a_procesar):
            try:
                nombre_en = item.get('name', '').capitalize()
                if not nombre_en: continue
                
                nombre_es = traductor.translate(nombre_en)
                
                instrucciones_en = item.get('instructions', [])
                descripcion_es = traductor.translate(" ".join(instrucciones_en)) if instrucciones_en else "Sin descripción."

                lista_musculos = []
                for m in item.get('primaryMuscles', []) + item.get('secondaryMuscles', []):
                    m_limpio = m.lower()
                    if m_limpio in DICCIONARIO_MUSCULOS:
                        lista_musculos.append(DICCIONARIO_MUSCULOS[m_limpio])
                
                musculos_unicos = list(dict.fromkeys([m for m in lista_musculos if m]))
                grupo_muscular_unido = ", ".join(musculos_unicos) if musculos_unicos else "General"

                imagen_url = ""
                imagen_url1 = ""
                imagenes = item.get('images', [])
                
                if isinstance(imagenes, list) and len(imagenes) > 0:
                    imagen_url = f"{base_url_img}{imagenes[0]}"
                    if len(imagenes) > 1:
                        imagen_url1 = f"{base_url_img}{imagenes[1]}"

                nombre_url = nombre_es.replace(" ", "+")
                guia_ejecucion = f"https://www.youtube.com/results?search_query={nombre_url}+ejercicio+gimnasio"

                ejercicio, created = Ejercicios.objects.get_or_create( 
                    nombre=nombre_es[:100], 
                    defaults={
                        'grupo_muscular': grupo_muscular_unido[:255], 
                        'descripcion': descripcion_es,
                        'guia_ejecucion': guia_ejecucion[:255],
                        'imagen_url': imagen_url[:255] if imagen_url else None,
                        'imagen_url1': imagen_url1[:255] if imagen_url1 else None
                    }
                )

                if created: creados += 1
                
                if (i + 1) % 10 == 0:
                    self.stdout.write(f"Procesados {i + 1}/{len(ejercicios_a_procesar)}...")
                
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Ignorando error en '{nombre_en}': {e}"))

        self.stdout.write(self.style.SUCCESS(f"¡Listo! Se crearon {creados} ejercicios con imágenes e instrucciones en español."))