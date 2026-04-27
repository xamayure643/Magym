from rest_framework import serializers
from .models import RegistrosProgreso

class RegistrosProgresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrosProgreso
        fields = [
            'id_progreso', 'id_usuario', 'id_ejercicio', 'fecha', 
            'num_series', 'detalles_series', 'peso_actual', 
            'tiempo_carrera_min', 'marca_personal_kg'
        ]
        read_only_fields = ['id_usuario']