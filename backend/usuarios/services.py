import random
from twilio.rest import Client
from django.conf import settings

def enviar_sms_verificacion(telefono_destino):
    try:
        cliente = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        codigo_otp = str(random.randint(100000, 999999))
        
        if not telefono_destino.startswith('+'):
            telefono_destino = f'+34{telefono_destino}'

        mensaje = cliente.messages.create(
            body=f"MAGYM: Tu código de seguridad es {codigo_otp}. Caduca en 5 minutos. No lo compartas.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=telefono_destino
        )
        
        return codigo_otp 
        
    except Exception as e:
        print(f"Error al enviar SMS de Twilio: {e}")
        return None