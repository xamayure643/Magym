from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlimentosViewSet, RegistrosNutricionViewSet

router = DefaultRouter()
router.register(r'alimentos', AlimentosViewSet, basename='alimentos')
router.register(r'registros', RegistrosNutricionViewSet, basename='registros_nutricion')

urlpatterns = [
    path('', include(router.urls)),
]