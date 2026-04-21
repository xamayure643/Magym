from twilio.rest import Client
from django.conf import settings

def enviar_sms_bienvenida(telefono_destino, nombre_usuario):
    """
    Se comunica con la API de Twilio para enviar un SMS.
    """
    try:
        # Iniciamos el cliente de Twilio con las credenciales ocultas
        cliente = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # OJO: Twilio necesita el prefijo internacional. 
        # Si tus usuarios son de España, nos aseguramos de que empiece por +34
        if not telefono_destino.startswith('+'):
            telefono_destino = f'+34{telefono_destino}'

        mensaje = cliente.messages.create(
            body=f"¡Hola {nombre_usuario}! Bienvenido a MAGYM. Tu registro se ha completado con éxito.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=telefono_destino
        )
        return True
    except Exception as e:
        print(f"Error al enviar SMS de Twilio: {e}")
        return False