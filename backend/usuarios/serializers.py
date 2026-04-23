from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuarios
import re

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        # Añadidos todos los campos que pide la Tarea y el objetivo
        fields = ['nombre', 'correo', 'contrasena', 'telefono', 'peso', 'altura', 'genero', 'frecuencia_entrenamiento', 'objetivo']
        
        extra_kwargs = {
            'contrasena': {'write_only': True} 
        }

    def validate_contrasena(self, value):
        """
        Validar que la contraseña cumpla requisitos de seguridad.
        """
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una mayúscula.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial (!@#$%^&*...).")
        
        return value

    def validate_correo(self, value):
        """Validar que el correo sea único"""
        if Usuarios.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def create(self, validated_data):
        # 1. Hasheamos la contraseña
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        
        # 2. Forzamos que la cuenta nazca inactiva (pendiende de SMS)
        validated_data['cuenta_activa'] = False 
        
        return super().create(validated_data)