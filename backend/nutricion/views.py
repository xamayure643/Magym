from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.utils import timezone
from datetime import date

from .models import Alimentos, RegistrosNutricion
from .serializers import AlimentosSerializer, RegistrosNutricionSerializer

class AlimentosViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Controlador para listar y buscar alimentos (GET)
    """
    queryset = Alimentos.objects.all().order_by('nombre')
    serializer_class = AlimentosSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'nombre': ['icontains']
    }

class RegistrosNutricionViewSet(viewsets.ModelViewSet):
    """
    Controlador para los registros de macros del usuario
    """
    serializer_class = RegistrosNutricionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RegistrosNutricion.objects.filter(id_usuario=self.request.user)

        if self.action == 'list':
            fecha_consulta = self.request.query_params.get('fecha', date.today())
            queryset = queryset.filter(fecha=fecha_consulta)

        return queryset.order_by('-id_registro')

    def create(self, request, *args, **kwargs):
        id_alimento = request.data.get('id_alimento')
        cantidad_gramos = request.data.get('cantidad_gramos')
        fecha_registro = request.data.get('fecha', timezone.now().date())

        if not id_alimento or not cantidad_gramos:
            return Response({"error": "Faltan datos obligatorios (id_alimento, cantidad_gramos)"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            gramos = float(cantidad_gramos)
            alimento = Alimentos.objects.get(id_alimento=id_alimento)
            
            calorias_calculadas = float(alimento.calorias_por_gramo) * gramos
            proteinas_calculadas = float(alimento.proteinas_por_gramo) * gramos

            registro = RegistrosNutricion.objects.create(
                id_usuario=request.user,
                id_alimento=alimento,
                fecha=fecha_registro,
                cantidad_gramos=gramos,
                calorias_calculadas=calorias_calculadas,
                proteinas_calculadas=proteinas_calculadas
            )

            serializer = self.get_serializer(registro)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Alimentos.DoesNotExist:
            return Response({"error": "El alimento no existe"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"error": "La cantidad de gramos debe ser un número"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error al guardar: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Endpoint personalizado GET /api/nutricion/registros/hoy/ (u otra fecha)
    @action(detail=False, methods=['get'])
    def hoy(self, request):
        fecha_consulta = request.query_params.get('fecha', date.today())
        registros = RegistrosNutricion.objects.filter(id_usuario=request.user, fecha=fecha_consulta)
        
        totales = registros.aggregate(
            total_calorias=Sum('calorias_calculadas'),
            total_proteinas=Sum('proteinas_calculadas')
        )

        return Response({
            "fecha": fecha_consulta,
            "totales": {
                "calorias": totales['total_calorias'] or 0,
                "proteinas": totales['total_proteinas'] or 0,
            }
        })