from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuarios
import re

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = ['nombre', 'correo', 'contrasena', 'telefono', 'peso', 'altura']
        
        extra_kwargs = {
            'contrasena': {'write_only': True} 
        }

    def validate_contrasena(self, value):
        """
        Validar que la contraseña cumpla requisitos de seguridad:
        - Mínimo 8 caracteres
        - Al menos una mayúscula
        - Al menos un número
        - Al menos un carácter especial
        """
        if len(value) < 8:
            raise serializers.ValidationError(
                "La contraseña debe tener al menos 8 caracteres."
            )
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos una mayúscula."
            )
        
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos un número."
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos un carácter especial (!@#$%^&*...)."
            )
        
        return value

    def validate_correo(self, value):
        """Validar que el correo sea único (ya está en el modelo, pero lo hacemos explícito)"""
        if Usuarios.objects.filter(correo=value).exists():
            raise serializers.ValidationError(
                "Este correo ya está registrado."
            )
        return value

    def create(self, validated_data):
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        
        return super().create(validated_data)