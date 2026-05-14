from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import RegistrosProgreso
from .serializers import RegistrosProgresoSerializer
from entrenamientos.models import Ejercicios
from django.db import transaction

class RegistrosProgresoViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrosProgresoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RegistrosProgreso.objects.filter(id_usuario=self.request.user)
        fecha_filtro = self.request.query_params.get('fecha')
        if fecha_filtro:
            queryset = queryset.filter(fecha=fecha_filtro)
        return queryset.order_by('-fecha')

    def create(self, request, *args, **kwargs):
        registros_data = request.data
        
        if not isinstance(registros_data, list):
            registros_data = [registros_data]

        try:
            with transaction.atomic():
                creados_o_actualizados = []
                for item in registros_data:
                    id_ejercicio = item.get('id_ejercicio')
                    fecha = item.get('fecha')
                    
                    if not id_ejercicio or not fecha:
                        continue
                    
                    ejercicio_instancia = Ejercicios.objects.get(id_ejercicio=id_ejercicio)

                    registro, created = RegistrosProgreso.objects.update_or_create(
                        id_usuario=request.user,
                        id_ejercicio=ejercicio_instancia,
                        fecha=fecha,
                        defaults={
                            'num_series': item.get('num_series', 0),
                            'detalles_series': item.get('detalles_series', [])
                        }
                    )
                    creados_o_actualizados.append(registro)
                    
            serializer = self.get_serializer(creados_o_actualizados, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Ejercicios.DoesNotExist:
            return Response({"error": "Ejercicio no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)