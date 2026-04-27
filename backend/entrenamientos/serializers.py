from rest_framework import serializers
from .models import Ejercicios, UsuariosEjerciciosFavoritos

class EjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ejercicios
        fields = ['id_ejercicio', 'nombre', 'grupo_muscular', 'descripcion', 'guia_ejecucion', 'imagen_url', 'imagen_url1']

class UsuariosEjerciciosFavoritosSerializer(serializers.ModelSerializer):
    ejercicio_detalle = EjercicioSerializer(source='id_ejercicio', read_only=True)
    
    class Meta:
        model = UsuariosEjerciciosFavoritos
        fields = ['id_usuario', 'id_ejercicio', 'ejercicio_detalle']
        read_only_fields = ['id_usuario']