from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/entrenamientos/', include('entrenamientos.urls')),
    path('api/progreso/', include('progreso.urls')),
    path('api/nutricion/', include('nutricion.urls')),
    

]
