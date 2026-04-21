from django.db import models

# Create your models here.
class Alimentos(models.Model):
    id_alimento = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    calorias_por_gramo = models.DecimalField(max_digits=6, decimal_places=4)
    proteinas_por_gramo = models.DecimalField(max_digits=6, decimal_places=4)

    class Meta:
        managed = False
        db_table = 'alimentos'

class RegistrosNutricion(models.Model):
    id_registro = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    id_alimento = models.ForeignKey(Alimentos, on_delete=models.CASCADE, db_column='id_alimento')
    fecha = models.DateField()
    cantidad_gramos = models.DecimalField(max_digits=7, decimal_places=2)
    calorias_calculadas = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    proteinas_calculadas = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'registros_nutricion'
