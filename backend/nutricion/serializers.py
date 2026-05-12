from rest_framework import serializers
from .models import Alimentos, RegistrosNutricion

class AlimentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alimentos
        fields = '__all__'

class RegistrosNutricionSerializer(serializers.ModelSerializer):
    alimento_nombre = serializers.CharField(source='id_alimento.nombre', read_only=True)

    class Meta:
        model = RegistrosNutricion
        fields = ['id_registro', 'id_usuario', 'id_alimento', 'alimento_nombre', 'fecha', 'cantidad_gramos', 'calorias_calculadas', 'proteinas_calculadas']
        read_only_fields = ['id_usuario', 'calorias_calculadas', 'proteinas_calculadas']