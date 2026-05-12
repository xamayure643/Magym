import requests
import time
from django.core.management.base import BaseCommand
from nutricion.models import Alimentos

class Command(BaseCommand):
    help = 'Puebla la tabla de alimentos desde la base de datos española de OFF con sistema anticaídas (503)'

    def handle(self, *args, **kwargs):
        alimentos_creados = 0
        
        # Categorías universales
        categorias = [
            'en:dairies', 'en:cheeses', 'en:meats', 'en:fishes', 
            'en:fruits', 'en:vegetables', 'en:cereals', 'en:legumes', 
            'en:nuts', 'en:pastas', 'en:breads'
        ]
        
        self.stdout.write(self.style.SUCCESS('Iniciando descarga optimizada (con sistema de reintentos)...'))

        headers = {
            'User-Agent': 'MiProyectoTFG - Python/Django - alejandromayaureba@gmail.com'
        }

        for categoria in categorias:
            self.stdout.write(self.style.WARNING(f"\n--- Procesando: {categoria} ---"))
            insertados = 0

            url = f"https://es.openfoodfacts.org/api/v2/search?categories_tags={categoria}&fields=product_name,nutriments&page_size=100&page=1"
            
            # --- SISTEMA DE REINTENTOS ---
            exito = False
            for intento in range(3): # Lo intentará hasta 3 veces si falla
                try:
                    response = requests.get(url, headers=headers, timeout=15)
                    
                    if response.status_code == 200:
                        exito = True
                        break # Si funciona a la primera, salimos del bucle de reintentos
                    
                    elif response.status_code == 503:
                        self.stdout.write(self.style.WARNING(f"Servidor saturado (503). Reintentando en 5 segundos... (Intento {intento + 1}/3)"))
                        time.sleep(5) # Esperamos 5 segundos antes de volver a molestar al servidor
                    else:
                        self.stdout.write(self.style.ERROR(f"Error HTTP {response.status_code}. Saltando."))
                        break

                except requests.exceptions.RequestException as e:
                    self.stdout.write(self.style.ERROR(f"Error de red: {str(e)}. Reintentando..."))
                    time.sleep(5)

            # Si después de los 3 intentos sigue fallando, pasamos a la siguiente categoría
            if not exito:
                self.stdout.write(self.style.ERROR(f"Imposible obtener {categoria} tras varios intentos. Pasando a la siguiente."))
                continue
            # ------------------------------

            productos = response.json().get('products', [])

            for producto in productos:
                if insertados >= 30: # Límite
                    break
                    
                nombre = producto.get('product_name')
                if not nombre:
                    continue

                calorias_100g = producto.get('nutriments', {}).get('energy-kcal_100g')
                proteinas_100g = producto.get('nutriments', {}).get('proteins_100g')

                if calorias_100g is not None and proteinas_100g is not None:
                    if float(calorias_100g) > 900 or float(proteinas_100g) > 100:
                        continue

                    calorias_por_gramo = float(calorias_100g) / 100
                    proteinas_por_gramo = float(proteinas_100g) / 100
                    
                    nombre_limpio = nombre.capitalize()

                    # El get_or_create nos salva de duplicar los que ya se bajaron antes
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
                        self.stdout.write(f"✓ Insertado: {nombre_limpio[:40]}...")

            time.sleep(2) # Aumentamos un poquito la pausa final para no saturarlos

        self.stdout.write(self.style.SUCCESS(f'\n¡Éxito! Total de NUEVOS alimentos creados hoy: {alimentos_creados}'))