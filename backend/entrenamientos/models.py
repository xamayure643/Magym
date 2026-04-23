from django.db import models

# Create your models here.
class Ejercicios(models.Model):
    id_ejercicio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    grupo_muscular = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    guia_ejecucion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ejercicios'

class Rutinas(models.Model):
    id_rutina = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    nombre = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'rutinas'

class RutinasEjercicios(models.Model):
    id_rutina = models.ForeignKey(Rutinas, on_delete=models.CASCADE, db_column='id_rutina')
    id_ejercicio = models.ForeignKey(Ejercicios, on_delete=models.CASCADE, db_column='id_ejercicio')
    orden_ejecucion = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'rutinas_ejercicios'
        unique_together = (('id_rutina', 'id_ejercicio'),)

class UsuariosEjerciciosFavoritos(models.Model):
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    id_ejercicio = models.ForeignKey(Ejercicios, on_delete=models.CASCADE, db_column='id_ejercicio')

    class Meta:
        managed = False
        db_table = 'usuarios_ejercicios_favoritos'
        unique_together = (('id_usuario', 'id_ejercicio'),)
