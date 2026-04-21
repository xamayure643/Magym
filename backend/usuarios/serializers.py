from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuarios

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = ['nombre', 'correo', 'contrasena', 'telefono', 'peso', 'altura']
        
        extra_kwargs = {
            'contrasena': {'write_only': True} 
        }

    def create(self, validated_data):
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        
        return super().create(validated_data)