from rest_framework import serializers
from .models import Ejercicios, UsuariosEjerciciosFavoritos, Rutinas, RutinasEjercicios

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

class RutinaSerializer(serializers.ModelSerializer):
    ejercicios = serializers.SerializerMethodField()

    class Meta:
        model = Rutinas
        fields = ['id_rutina', 'nombre', 'fecha_creacion', 'ejercicios']
        read_only_fields = ['id_rutina', 'fecha_creacion']

    def get_ejercicios(self, obj):
        pivotes = RutinasEjercicios.objects.filter(id_rutina=obj).order_by('orden_ejecucion')
        return [
            {
                "id_ejercicio": p.id_ejercicio.id_ejercicio,
                "nombre": p.id_ejercicio.nombre,
                "imagen_url": p.id_ejercicio.imagen_url,
                "orden_ejecucion": p.orden_ejecucion,
            } for p in pivotes
        ]