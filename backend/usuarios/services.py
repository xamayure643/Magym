import random
from twilio.rest import Client
from django.conf import settings

def enviar_sms_verificacion(telefono_destino):
    """
    Genera un código de 6 dígitos y se comunica con la API de Twilio para enviarlo.
    """
    try:
        cliente = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # 1. Generamos un código aleatorio de 6 cifras
        codigo_otp = str(random.randint(100000, 999999))
        
        if not telefono_destino.startswith('+'):
            telefono_destino = f'+34{telefono_destino}'

        # 2. Enviamos el código en el mensaje
        mensaje = cliente.messages.create(
            body=f"MAGYM: Tu código de seguridad es {codigo_otp}. Caduca en 5 minutos. No lo compartas.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=telefono_destino
        )
        
        # 3. Devolvemos el código para guardarlo en la Caché de Django
        return codigo_otp 
        
    except Exception as e:
        print(f"Error al enviar SMS de Twilio: {e}")
        return None