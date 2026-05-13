from django.contrib import admin
from .models import Rutina, Ejercicio, EjercicioRutina

# Register your models here.
admin.site.register(Rutina)
admin.site.register(Ejercicio)
admin.site.register(EjercicioRutina)