from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EjerciciosViewSet, FavoritosViewSet, RutinasViewSet

router = DefaultRouter()
router.register(r'ejercicios', EjerciciosViewSet, basename='ejercicios')
router.register(r'favoritos', FavoritosViewSet, basename='favoritos')
router.register(r'rutinas', RutinasViewSet, basename='rutinas')

urlpatterns = [
    path('', include(router.urls)),
]