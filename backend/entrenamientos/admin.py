from django.contrib import admin
from .models import Ejercicios, RutinasEjercicios, Rutinas, UsuariosEjerciciosFavoritos

# Register your models here.
admin.site.register(Rutinas)
admin.site.register(Ejercicios)
admin.site.register(RutinasEjercicios)
admin.site.register(UsuariosEjerciciosFavoritos)