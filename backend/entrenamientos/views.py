from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from .models import Ejercicios, UsuariosEjerciciosFavoritos, Rutinas, RutinasEjercicios
from .serializers import EjercicioSerializer, UsuariosEjerciciosFavoritosSerializer, RutinaSerializer

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
        
        if not id_ejercicio:
            return Response({"error": "Debes proveer un id_ejercicio"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ejercicio = Ejercicios.objects.get(id_ejercicio=id_ejercicio)
        except Ejercicios.DoesNotExist:
            return Response({"error": "El ejercicio no existe"}, status=status.HTTP_404_NOT_FOUND)

        favorito_existente = UsuariosEjerciciosFavoritos.objects.filter(
            id_usuario=request.user,
            id_ejercicio=ejercicio
        ).first()

        if favorito_existente:
            borrado, _ = UsuariosEjerciciosFavoritos.objects.filter(
                id_usuario=request.user,
                id_ejercicio__id_ejercicio=id_ejercicio
            ).delete()
            return Response({"mensaje": "Eliminado de favoritos", "accion": "eliminado", "deleted": borrado}, status=status.HTTP_200_OK)

        try:
            UsuariosEjerciciosFavoritos.objects.create(
                id_usuario=request.user,
                id_ejercicio=ejercicio
            )
            return Response({"mensaje": "Añadido a favoritos"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error en base de datos: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        try:
            RutinasEjercicios.objects.filter(id_rutina=rutina).delete()
            rutina.delete()
            return Response({"mensaje": "Rutina eliminada"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)