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
        
class RutinasViewSet(viewsets.ModelViewSet):
    serializer_class = RutinaSerializer
    permission_classes = [IsAuthenticated]

    # GET: Lista solo las rutinas del usuario autenticado
    def get_queryset(self):
        return Rutinas.objects.filter(id_usuario=self.request.user).order_by('-fecha_creacion')

    # POST: Crea rutina y su tabla pivote
    def create(self, request, *args, **kwargs):
        nombre = request.data.get('nombre')
        ejercicios_data = request.data.get('ejercicios', []) # Formato esperado: [{'id_ejercicio': 1, 'orden_ejecucion': 1}, ...]

        if not nombre:
            return Response({"error": "El nombre de la rutina es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic(): # Si algo falla en la tabla pivote, aborta la creación de rutina
                rutina = Rutinas.objects.create(
                    id_usuario=request.user,
                    nombre=nombre,
                    fecha_creacion=timezone.now()
                )
                
                # Mapeado manual de pivotes
                for item in ejercicios_data:
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

    # PUT/PATCH: Actualiza nombre y regenera los ejercicios
    def update(self, request, *args, **kwargs):
        rutina = self.get_object()
        nombre = request.data.get('nombre', rutina.nombre)
        ejercicios_data = request.data.get('ejercicios', None)

        try:
            with transaction.atomic():
                rutina.nombre = nombre
                rutina.save()

                if ejercicios_data is not None:
                    # En lugar de alterar 1 a 1, borramos las relaciones viejas y sobreescribimos
                    RutinasEjercicios.objects.filter(id_rutina=rutina).delete()
                    for item in ejercicios_data:
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

    # DELETE: Borra rutina (la pivote se borra por CASCADE oa mano para seguridad)
    def destroy(self, request, *args, **kwargs):
        rutina = self.get_object()
        try:
            # Borrado seguro previo en tabla pivote no administrada
            RutinasEjercicios.objects.filter(id_rutina=rutina).delete()
            rutina.delete()
            return Response({"mensaje": "Rutina eliminada"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)