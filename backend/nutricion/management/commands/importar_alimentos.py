import requests
import time
from django.core.management.base import BaseCommand
from nutricion.models import Alimentos

class Command(BaseCommand):
    help = 'Puebla la tabla de alimentos'

    def handle(self, *args, **kwargs):
        alimentos_creados = 0
        
        #Tags de categorías para buscarlas en la API
        categorias = [
            'en:dairies', 'en:cheeses', 'en:meats', 'en:fishes', 
            'en:fruits', 'en:vegetables', 'en:cereals', 'en:legumes', 
            'en:nuts', 'en:pastas', 'en:breads'
        ]
        
        self.stdout.write(self.style.SUCCESS('Descargando JSON de alimentos...'))

        headers = {
            'User-Agent': 'MiProyectoTFG - Python/Django - alejandromayaureba@gmail.com'
        }

        for categoria in categorias:
            self.stdout.write(self.style.WARNING(f"\n--- Procesando: {categoria} ---"))
            insertados = 0

            #Alimentos
            url_json = f"https://es.openfoodfacts.org/api/v2/search?categories_tags={categoria}&fields=product_name,nutriments&page_size=100&page=1"
            
            exito = False
            for intento in range(3):
                try:
                    response = requests.get(url_json, headers=headers, timeout=15) #Descargamos el JSON
                    
                    if response.status_code == 200:
                        exito = True
                        break
                    
                    elif response.status_code == 503:
                        self.stdout.write(self.style.WARNING(f"Servidor saturado (503). Reintentando en 5 segundos... (Intento {intento + 1}/3)"))
                        time.sleep(5)
                    else:
                        self.stdout.write(self.style.ERROR(f"Error HTTP {response.status_code}. Saltando."))
                        break

                except requests.exceptions.RequestException as e:
                    self.stdout.write(self.style.ERROR(f"Error de red: {str(e)}. Reintentando..."))
                    time.sleep(5)

            if not exito:
                self.stdout.write(self.style.ERROR(f"Imposible obtener {categoria} tras varios intentos. Pasando a la siguiente."))
                continue

            productos = response.json().get('products', [])

            for producto in productos:
                if insertados >= 30:
                    break
                    
                nombre = producto.get('product_name')
                if not nombre:
                    continue

                calorias_100g = producto.get('nutriments', {}).get('energy-kcal_100g')
                proteinas_100g = producto.get('nutriments', {}).get('proteins_100g')

                if calorias_100g is None or proteinas_100g is None:
                    continue


                calorias_por_gramo = float(calorias_100g) / 100
                proteinas_por_gramo = float(proteinas_100g) / 100
                    
                nombre_limpio = nombre.capitalize()

                obj, created = Alimentos.objects.get_or_create(
                    nombre=nombre_limpio[:100], 
                    defaults={
                        'calorias_por_gramo': calorias_por_gramo,
                        'proteinas_por_gramo': proteinas_por_gramo
                    }
                )

                if created:
                    alimentos_creados += 1
                    insertados += 1
                    self.stdout.write(f"Insertado: {nombre_limpio[:100]}...")

            time.sleep(3)

        self.stdout.write(self.style.SUCCESS(f'\n¡Éxito! Total de nuevos alimentos creados: {alimentos_creados}'))