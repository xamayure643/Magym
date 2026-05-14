from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from .models import Ejercicios, UsuariosEjerciciosFavoritos, Rutinas, RutinasEjercicios
from .serializers import EjercicioSerializer, UsuariosEjerciciosFavoritosSerializer, RutinaSerializer
from django.shortcuts import get_object_or_404

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

    def create(self, request):
        id_ejercicio = request.data.get('id_ejercicio')
        ejercicio = get_object_or_404(Ejercicios, id_ejercicio=id_ejercicio) # Uso de helper

        favorito, created = UsuariosEjerciciosFavoritos.objects.get_or_create(
            id_usuario=request.user,
            id_ejercicio=ejercicio
        )

        if not created:
            favorito.delete()
            return Response({"mensaje": "Eliminado de favoritos", "accion": "eliminado"}, status=status.HTTP_200_OK)

        return Response({"mensaje": "Añadido a favoritos"}, status=status.HTTP_201_CREATED)
        
class RutinasViewSet(viewsets.ModelViewSet):
    serializer_class = RutinaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rutinas.objects.filter(id_usuario=self.request.user).order_by('-fecha_creacion')

    def create(self, request):
        nombre = request.data.get('nombre')
        ejercicios_datos = request.data.get('ejercicios', [])

        if not nombre:
            return Response({"error": "El nombre de la rutina es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                rutina = Rutinas.objects.create(
                    id_usuario=request.user,
                    nombre=nombre,
                    fecha_creacion=timezone.now()
                )
                
                for item in ejercicios_datos:
                    ejercicio = Ejercicios.objects.get(id_ejercicio=item['id_ejercicio'])
                    RutinasEjercicios.objects.create(
                        id_rutina=rutina,
                        id_ejercicio=ejercicio,
                        orden_ejecucion=item.get('orden_ejecucion', 1)
                    )
                
            serializer = self.get_serializer(rutina)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Error al crear: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        rutina = self.get_object()
        nombre = request.data.get('nombre', rutina.nombre)
        ejercicios_datos = request.data.get('ejercicios', None)

        try:
            with transaction.atomic():
                rutina.nombre = nombre
                rutina.save()

                if ejercicios_datos is not None:
                    RutinasEjercicios.objects.filter(id_rutina=rutina).delete()
                    for item in ejercicios_datos:
                        ejercicio = Ejercicios.objects.get(id_ejercicio=item['id_ejercicio'])
                        RutinasEjercicios.objects.create(
                            id_rutina=rutina,
                            id_ejercicio=ejercicio,
                            orden_ejecucion=item.get('orden_ejecucion', 1)
                        )
            
            serializer = self.get_serializer(rutina)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al actualizar: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        rutina = self.get_object()
        rutina.delete() # El CASCADE de la BD ya limpia RutinasEjercicios
        return Response({"mensaje": "Rutina eliminada"}, status=status.HTTP_204_NO_CONTENT)