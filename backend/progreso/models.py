from django.db import models

# Create your models here.
class RegistrosProgreso(models.Model):
    id_progreso = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    id_ejercicio = models.ForeignKey('entrenamientos.Ejercicios', on_delete=models.CASCADE, db_column='id_ejercicio', blank=True, null=True)
    fecha = models.DateField()
    num_series = models.IntegerField(blank=True, null=True)
    detalles_series = models.JSONField(blank=True, null=True)
    peso_actual = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    tiempo_carrera_min = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    marca_personal_kg = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'registros_progreso'

class RecomendacionesIa(models.Model):
    id_recomendacion = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    fecha = models.DateTimeField(blank=True, null=True)
    mensaje = models.TextField()
    tipo_alerta = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'recomendaciones_ia'