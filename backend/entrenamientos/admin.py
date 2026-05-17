from django.contrib import admin
from .models import Ejercicios, RutinasEjercicios, Rutinas, UsuariosEjerciciosFavoritos

admin.site.register(Rutinas)
admin.site.register(Ejercicios)
admin.site.register(RutinasEjercicios)
admin.site.register(UsuariosEjerciciosFavoritos)