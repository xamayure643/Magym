from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Usuarios

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise AuthenticationFailed("El token no contiene identificador de usuario.")
            
            usuario = Usuarios.objects.get(id_usuario=user_id)
            
            usuario.is_authenticated = True 
            
            return usuario
        except Usuarios.DoesNotExist:
            raise AuthenticationFailed("Usuario no encontrado en el sistema.")