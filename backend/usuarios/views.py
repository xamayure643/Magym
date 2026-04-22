from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegistroUsuarioSerializer
from .services import enviar_sms_bienvenida
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from .models import Usuarios

class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # Pasamos los datos que llegan desde el Frontend al Serializador
        serializer = RegistroUsuarioSerializer(data=request.data)
        
        # Si los datos cumplen con el modelo (ej. el correo no está duplicado)
        if serializer.is_valid():
            usuario_guardado = serializer.save() # Aquí se ejecuta el create() de tu serializador
            telefono_real = request.data.get('telefono')
            nombre = request.data.get('nombre')

            # Enviar SMS de bienvenida con manejo de errores
            sms_enviado = enviar_sms_bienvenida(telefono_real, nombre)
            
            if sms_enviado:
                return Response(
                    {"mensaje": "Usuario registrado de forma segura. SMS de bienvenida en camino."}, 
                    status=status.HTTP_201_CREATED
                )
            else:
                # Si falla el SMS, devolvemos aviso pero el usuario sigue registrado
                return Response(
                    {"mensaje": "Usuario registrado. Error al enviar SMS de bienvenida, pero puedes continuar.", 
                     "error_sms": True}, 
                    status=status.HTTP_201_CREATED
                )
            
        # Si hay un error (ej. falta el nombre), devolvemos el fallo
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginUsuarioView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # Validar que los campos requeridos existan
        correo_recibido = request.data.get('correo')
        contrasena_recibida = request.data.get('contrasena')
        
        if not correo_recibido or not contrasena_recibida:
            return Response(
                {"error": "Correo y contraseña son requeridos."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Buscamos si el correo existe en tu tabla personalizada
        try:
            usuario = Usuarios.objects.get(correo=correo_recibido)
        except Usuarios.DoesNotExist:
            return Response(
                {"error": "Credenciales inválidas"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 2. Comparamos la contraseña en texto plano con el Hash de la BBDD
        if check_password(contrasena_recibida, usuario.contrasena):
            
            # 3. Si es correcto, fabricamos el Token JWT CORRECTAMENTE
            # Usamos RefreshToken() directo porque for_user() requiere 'id', no 'id_usuario'
            refresh = RefreshToken()
            
            # Personalizamos el "Payload" (los datos que viajan dentro de la pulsera)
            refresh['usuario_id'] = usuario.id_usuario
            refresh['nombre'] = usuario.nombre
            refresh['correo'] = usuario.correo

            # Devolvemos el Access Token y algunos datos útiles para React
            return Response({
                "mensaje": "Login exitoso",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "nombre": usuario.nombre,
                "usuario_id": usuario.id_usuario
            }, status=status.HTTP_200_OK)
            
        else:
            # Si la contraseña no coincide
            return Response(
                {"error": "Credenciales inválidas"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class RefreshTokenView(APIView):
    """
    View para refrescar el Access Token usando el Refresh Token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token es requerido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "mensaje": "Token refrescado correctamente"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Refresh token inválido o expirado: {str(e)}"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    View para hacer logout. Blacklistea el Refresh Token.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {"error": "Refresh token es requerido para hacer logout."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklistear el token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"mensaje": "Logout exitoso. Token invalidado."}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": f"Error al hacer logout: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
