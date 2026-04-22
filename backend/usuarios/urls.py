from django.urls import path
from .views import RegistroUsuarioView, LoginUsuarioView, RefreshTokenView, LogoutView, VerificarCodigoView

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('verificar-sms/', VerificarCodigoView.as_view(), name='verificar-sms'),
    path('login/', LoginUsuarioView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh-token'),
    path('logout/', LogoutView.as_view(), name='logout'),
]