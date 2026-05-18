from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuarios
import re

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = [
            'nombre', 'correo', 'contrasena', 'telefono', 'peso', 'altura',
            'genero', 'frecuencia_entrenamiento', 'objetivo'
            ]
        
        extra_kwargs = {
            'contrasena': {'write_only': True} 
        }

    def validate_contrasena(self, value):
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
        if Usuarios.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def create(self, validated_data):
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        validated_data['cuenta_activa'] = False 
        
        return super().create(validated_data)

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = [
            'id_usuario', 'nombre', 'correo', 'telefono', 'peso', 'altura', 
            'genero', 'frecuencia_entrenamiento', 'estado_suscripcion', 
            'fecha_registro', 'objetivo', 'cuenta_activa'
        ]
        read_only_fields = ['id_usuario', 'correo', 'estado_suscripcion', 'fecha_registro', 'cuenta_activa']
        
    def validate_frecuencia_entrenamiento(self, value):
        if value is not None and (value < 0 or value > 7):
            raise serializers.ValidationError("Los días de entrenamiento deben estar entre 0 y 7.")
        return value