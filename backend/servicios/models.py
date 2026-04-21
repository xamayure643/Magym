from django.db import models

# Create your models here.
class Entrenadores(models.Model):
    id_entrenador = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    especialidad = models.CharField(max_length=100, blank=True, null=True)
    verificado = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'entrenadores'


class Gimnasios(models.Model):
    id_gimnasio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'gimnasios'

class Promociones(models.Model):
    id_promocion = models.AutoField(primary_key=True)
    id_gimnasio = models.ForeignKey(Gimnasios, on_delete=models.CASCADE, db_column='id_gimnasio')
    titulo = models.CharField(max_length=150)
    contenido = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'promociones'

class MensajesChat(models.Model):
    id_mensaje = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    id_entrenador = models.ForeignKey(Entrenadores, on_delete=models.CASCADE, db_column='id_entrenador')
    fecha_hora = models.DateTimeField(blank=True, null=True)
    contenido = models.TextField()

    class Meta:
        managed = False
        db_table = 'mensajes_chat'

class UsuariosGimnasios(models.Model):
    id_usuario = models.ForeignKey('usuarios.Usuarios', on_delete=models.CASCADE, db_column='id_usuario')
    id_gimnasio = models.ForeignKey(Gimnasios, on_delete=models.CASCADE, db_column='id_gimnasio')

    class Meta:
        managed = False
        db_table = 'usuarios_gimnasios'
        unique_together = (('id_usuario', 'id_gimnasio'),)
