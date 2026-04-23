from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Usuarios

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """
        Sobrescribimos este método para que SimpleJWT busque al usuario 
        en nuestro modelo personalizado 'Usuarios' y no en 'auth_user'.
        """
        try:
            # Extraemos el ID del token
            user_id = validated_token.get('user_id')
            if not user_id:
                raise AuthenticationFailed("El token no contiene identificador de usuario.")
            
            # Buscamos en nuestro modelo personalizado
            usuario = Usuarios.objects.get(id_usuario=user_id)
            
            # DRF necesita que el objeto tenga esta propiedad para pasar el filtro de 'IsAuthenticated'
            usuario.is_authenticated = True 
            
            return usuario
        except Usuarios.DoesNotExist:
            raise AuthenticationFailed("Usuario no encontrado en el sistema.")