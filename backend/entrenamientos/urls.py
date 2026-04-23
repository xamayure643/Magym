from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EjerciciosViewSet, FavoritosViewSet

router = DefaultRouter()
router.register(r'ejercicios', EjerciciosViewSet, basename='ejercicios')
router.register(r'favoritos', FavoritosViewSet, basename='favoritos')

urlpatterns = [
    path('', include(router.urls)),
]