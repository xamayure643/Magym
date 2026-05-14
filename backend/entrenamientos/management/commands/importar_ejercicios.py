import requests
import time
from deep_translator import GoogleTranslator
from django.core.management.base import BaseCommand
from entrenamientos.models import Ejercicios

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
        ejercicios_a_procesar = ejercicios_api[:250]
#        creados = 0

        for i, item in enumerate(ejercicios_a_procesar):
            try:
                nombre_en = item.get('name', '').capitalize()
                if not nombre_en: continue
                
                nombre_es = traductor.translate(nombre_en)
                instrucciones_en = item.get('instructions', [])
                descripcion_es = traductor.translate(" ".join(instrucciones_en)) if instrucciones_en else "Sin descripción."

                musculos_sin_procesar = item.get('primaryMuscles', []) + item.get('secondaryMuscles', [])
                musculos_es = [DICCIONARIO_MUSCULOS[m.lower()] for m in musculos_sin_procesar if m.lower() in DICCIONARIO_MUSCULOS]
                grupo_muscular_unido = ", ".join(dict.fromkeys(musculos_es)) or "General"

                # Gestión de imágenes simplificada
                imagenes = item.get('images', [])
                img1 = f"{base_url_img}{imagenes[0]}" if imagenes else None
                img2 = f"{base_url_img}{imagenes[1]}" if len(imagenes) > 1 else None

                guia_ejecucion = f"https://www.youtube.com/results?search_query={nombre_es.replace(' ', '+')}+ejercicio"

                _, created = Ejercicios.objects.get_or_create( 
                    nombre=nombre_es[:100], 
                    defaults={
                        'grupo_muscular': grupo_muscular_unido[:255], 
                        'descripcion': descripcion_es,
                        'guia_ejecucion': guia_ejecucion[:255],
                        'imagen_url': img1,
                        'imagen_url1': img2
                    }
                )
                if created: creados += 1
                if (i + 1) % 10 == 0: self.stdout.write(f"Procesados {i + 1}...")
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error en '{nombre_en}': {e}"))

        self.stdout.write(self.style.SUCCESS(f"¡Listo! {creados} creados."))