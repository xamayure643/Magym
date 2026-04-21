from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet
import base64

class EncryptedDataField(models.CharField):
    description = "Almacena datos encriptados de forma bidireccional"

    def __init__(self, *args, **kwargs):
        key = base64.urlsafe_b64encode(settings.SECRET_KEY[:32].encode().ljust(32, b'\0'))
        self.cipher = Fernet(key)
        super().__init__(*args, **kwargs)

    def get_prep_value(self, value):
        # Se ejecuta al GUARDAR en la BBDD
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