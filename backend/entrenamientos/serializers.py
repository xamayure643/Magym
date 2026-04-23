from rest_framework import serializers
from .models import Ejercicios, UsuariosEjerciciosFavoritos

class EjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ejercicios
        fields = ['id_ejercicio', 'nombre', 'grupo_muscular', 'descripcion', 'guia_ejecucion']

class UsuariosEjerciciosFavoritosSerializer(serializers.ModelSerializer):
    # Anidamos el serializer para que al hacer GET el frontend reciba los datos del ejercicio completo
    ejercicio_detalle = EjercicioSerializer(source='id_ejercicio', read_only=True)
    
    class Meta:
        model = UsuariosEjerciciosFavoritos
        fields = ['id', 'id_usuario', 'id_ejercicio', 'ejercicio_detalle']
        read_only_fields = ['id_usuario'] # El usuario se saca del token, no se envía por el body