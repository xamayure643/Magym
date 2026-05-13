from django.contrib import admin
from .models import Alimentos, RegistrosNutricion

# Register your models here.
admin.site.register(Alimentos)
admin.site.register(RegistrosNutricion)