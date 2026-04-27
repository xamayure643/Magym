from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Ejercicios, UsuariosEjerciciosFavoritos
from .serializers import EjercicioSerializer, UsuariosEjerciciosFavoritosSerializer

class EjerciciosViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ejercicios.objects.all()
    serializer_class = EjercicioSerializer
    permission_classes = [IsAuthenticated] 
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'grupo_muscular': ['icontains']
    }

class FavoritosViewSet(viewsets.ModelViewSet):
    serializer_class = UsuariosEjerciciosFavoritosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UsuariosEjerciciosFavoritos.objects.filter(id_usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        id_ejercicio = request.data.get('id_ejercicio')
        
        if not id_ejercicio:
            return Response({"error": "Debes proveer id_ejercicio"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ejercicio = Ejercicios.objects.get(id_ejercicio=id_ejercicio)
        except Ejercicios.DoesNotExist:
            return Response({"error": "El ejercicio no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Aquí verificamos si ya existe antes de intentar crearlo de nuevo
        favorito_existente = UsuariosEjerciciosFavoritos.objects.filter(
            id_usuario=request.user,
            id_ejercicio=ejercicio
        ).first()

        if favorito_existente:
             favorito_existente.delete()
             return Response({"mensaje": "Eliminado de favoritos", "accion": "eliminado"}, status=status.HTTP_200_OK)

        # Lo creamos manualmente para evitar conflictos con primary keys ausentes ('id')
        try:
            UsuariosEjerciciosFavoritos.objects.create(
                id_usuario=request.user,
                id_ejercicio=ejercicio
            )
            return Response({"mensaje": "Añadido a favoritos"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error en base de datos: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)