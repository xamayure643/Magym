from django.contrib import admin
from .models import Ejercicios, RutinasEjercicios, Rutinas

# Register your models here.
admin.site.register(Rutinas)
admin.site.register(Ejercicios)
admin.site.register(RutinasEjercicios)