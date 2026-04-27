from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistrosProgresoViewSet

router = DefaultRouter()
router.register(r'registros', RegistrosProgresoViewSet, basename='registros-progreso')

urlpatterns = [
    path('', include(router.urls)),
]