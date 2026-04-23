from django.db import models
from .fields import EncryptedDataField

# Create your models here.
class Usuarios(models.Model):
    OBJETIVO_CHOICES = [
        ('Ganar músculo', 'Ganar músculo'),
        ('Perder grasa', 'Perder grasa'),
        ('Mantenimiento', 'Mantenimiento'),
    ]
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    correo = models.CharField(unique=True, max_length=150)
    contrasena = models.CharField(max_length=255)    
    telefono = EncryptedDataField(max_length=255) 
    peso = EncryptedDataField(max_length=255, blank=True, null=True)
    altura = EncryptedDataField(max_length=255, blank=True, null=True)
    qr_acceso = EncryptedDataField(max_length=255, blank=True, null=True)
    genero = models.CharField(max_length=9, blank=True, null=True)
    frecuencia_entrenamiento = models.IntegerField(blank=True, null=True)
    estado_suscripcion = models.CharField(max_length=50, blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)
    objetivo = models.CharField(max_length=50, choices=OBJETIVO_CHOICES, blank=True, null=True)
    cuenta_activa = models.BooleanField(default=False)
    
    class Meta:
        managed = False
        db_table = 'usuarios'
