from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet
import base64

class EncryptedDataField(models.CharField):
    description = "Almacena datos encriptados de forma bidireccional"

    def __init__(self, *args, **kwargs):
        # 1. Intentamos leer la clave dedicada, si no existe, usamos el SECRET_KEY como respaldo
        raw_key = getattr(settings, 'ENCRYPTION_KEY', None) or settings.SECRET_KEY
        
        # 2. Formateamos la clave para que Fernet no se queje (32 bytes en base64)
        valid_key = base64.urlsafe_b64encode(raw_key[:32].encode().ljust(32, b'\0'))
        self.cipher = Fernet(valid_key)
        
        super().__init__(*args, **kwargs)

    def get_prep_value(self, value):
        if value is None or value == '': return value
        return self.cipher.encrypt(str(value).encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None or value == '': return value
        try:
            return self.cipher.decrypt(value.encode()).decode()
        except:
            return "Error: Clave corrupta"

    def to_python(self, value):
        return value