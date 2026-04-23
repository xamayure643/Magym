from django.core.management.base import BaseCommand
from entrenamientos.models import Ejercicios

class Command(BaseCommand):
    help = 'Puebla la base de datos con un catálogo inicial de 20 ejercicios variados'

    def handle(self, *args, **kwargs):
        ejercicios_data = [
            # Pecho y músculos auxiliares
            {"nombre": "Press de Banca Plano", "grupo_muscular": "Pecho, Tríceps", "descripcion": "Ejercicio compuesto básico con barra para el pectoral mayor. Involucra el tríceps y deltoides anterior.", "guia_ejecucion": "https://ejemplo.com/press-banca.mp4"},
            {"nombre": "Press Inclinado con Mancuernas", "grupo_muscular": "Pecho, Hombros", "descripcion": "Variante para enfatizar el haz clavicular del pectoral y hombros frontales.", "guia_ejecucion": "https://ejemplo.com/press-inclinado.mp4"},
            {"nombre": "Aperturas en Polea", "grupo_muscular": "Pecho", "descripcion": "Ejercicio de aislamiento que mantiene la tensión continua. Trabajo puramente pectoral.", "guia_ejecucion": "https://ejemplo.com/aperturas.mp4"},
            {"nombre": "Flexiones", "grupo_muscular": "Pecho, Tríceps", "descripcion": "Ejercicio con peso corporal para hipertrofia del torso.", "guia_ejecucion": "https://ejemplo.com/flexiones.mp4"},
            
            # Espalda y músculos auxiliares
            {"nombre": "Dominadas", "grupo_muscular": "Espalda, Bíceps", "descripcion": "Tracción vertical excelente para desarrollar amplitud dorsal y bíceps braquial.", "guia_ejecucion": "https://ejemplo.com/dominadas.mp4"},
            {"nombre": "Remo con Barra", "grupo_muscular": "Espalda, Lumbares", "descripcion": "Tracción horizontal con peso libre para grosor de espalda y soporte lumbar.", "guia_ejecucion": "https://ejemplo.com/remo-barra.mp4"},
            {"nombre": "Jalón al Pecho", "grupo_muscular": "Espalda, Bíceps", "descripcion": "Alternativa de tracción vertical en polea.", "guia_ejecucion": "https://ejemplo.com/jalon.mp4"},
            {"nombre": "Pullover en Polea", "grupo_muscular": "Espalda", "descripcion": "Aislamiento del dorsal sin participación del bíceps.", "guia_ejecucion": "https://ejemplo.com/pullover.mp4"},
            
            # Piernas
            {"nombre": "Sentadilla Libre", "grupo_muscular": "Piernas, Glúteos", "descripcion": "Ejercicio rey para el desarrollo del tren inferior completo.", "guia_ejecucion": "https://ejemplo.com/sentadilla.mp4"},
            {"nombre": "Prensa de Piernas", "grupo_muscular": "Piernas", "descripcion": "Permite cargar peso sin tensión directa en la zona lumbar.", "guia_ejecucion": "https://ejemplo.com/prensa.mp4"},
            {"nombre": "Peso Muerto Rumano", "grupo_muscular": "Isquios, Glúteos, Lumbares", "descripcion": "Focalizado en la cadena posterior: isquiotibiales y glúteos.", "guia_ejecucion": "https://ejemplo.com/pmr.mp4"},
            {"nombre": "Extensiones de Cuádriceps", "grupo_muscular": "Cuádriceps", "descripcion": "Aislamiento total del cuádriceps en máquina libre.", "guia_ejecucion": "https://ejemplo.com/extension-cuad.mp4"},
            {"nombre": "Curl Femoral Tumbado", "grupo_muscular": "Isquiotibiales", "descripcion": "Trabajo específico de la parte posterior de la pierna.", "guia_ejecucion": "https://ejemplo.com/curl-femoral.mp4"},
            
            # Hombros
            {"nombre": "Press Militar", "grupo_muscular": "Hombros, Tríceps", "descripcion": "Empuje por encima de la cabeza para el deltoides anterior y tríceps.", "guia_ejecucion": "https://ejemplo.com/press-militar.mp4"},
            {"nombre": "Elevaciones Laterales", "grupo_muscular": "Hombros", "descripcion": "Estimulación del deltoides lateral para amplitud. Trabajo de aislamiento.", "guia_ejecucion": "https://ejemplo.com/elevaciones.mp4"},
            {"nombre": "Face Pull", "grupo_muscular": "Hombros, Trapecios", "descripcion": "Trabaja el deltoides posterior, la higiene postural y trapecio.", "guia_ejecucion": "https://ejemplo.com/face-pull.mp4"},
            
            # Brazos
            {"nombre": "Curl de Bíceps con Barra", "grupo_muscular": "Bíceps", "descripcion": "Construye masa en el bíceps braquial.", "guia_ejecucion": "https://ejemplo.com/curl-biceps.mp4"},
            {"nombre": "Curl Martillo", "grupo_muscular": "Bíceps, Antebrazos", "descripcion": "Enfatiza el braquial, bíceps y el braquiorradial del antebrazo.", "guia_ejecucion": "https://ejemplo.com/curl-martillo.mp4"},
            {"nombre": "Extensiones de Tríceps Polea", "grupo_muscular": "Tríceps", "descripcion": "Aislamiento fundamental para las tres cabezas del tríceps.", "guia_ejecucion": "https://ejemplo.com/extension-triceps.mp4"},
            {"nombre": "Press Francés", "grupo_muscular": "Tríceps", "descripcion": "Ejercicio libre para la cabeza larga del tríceps.", "guia_ejecucion": "https://ejemplo.com/press-frances.mp4"}
        ]

        creados = 0
        omitidos = 0

        for data in ejercicios_data:
            ejercicio, created = Ejercicios.objects.get_or_create(
                nombre=data['nombre'],
                defaults={
                    'grupo_muscular': data['grupo_muscular'],
                    'descripcion': data['descripcion'],
                    'guia_ejecucion': data['guia_ejecucion']
                }
            )
            # Si el ejercicio ya existía, pero quieres actualizar los grupos musculares, puedes hacerlo aquí
            if not created:
                if ejercicio.grupo_muscular != data['grupo_muscular']:
                    ejercicio.grupo_muscular = data['grupo_muscular']
                    ejercicio.save(update_fields=['grupo_muscular'])
                omitidos += 1
            else:
                creados += 1

        self.stdout.write(self.style.SUCCESS(f'Tarea completada: {creados} ejercicios creados. {omitidos} verificados/actualizados.'))