from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

from .serializers import RegistroUsuarioSerializer
from .services import enviar_sms_verificacion
from .models import Usuarios


class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        
        if serializer.is_valid():
            # 1. GUARDAMOS en BD directamente (quedará 'cuenta_activa = False' por el serializer)
            usuario = serializer.save()
            
            telefono_real = request.data.get('telefono')
            correo = request.data.get('correo') 

            # 2. Generamos y enviamos el SMS
            codigo_generado = enviar_sms_verificacion(telefono_real)
            
            if codigo_generado:
                # 3. Guardamos SOLO el código en la caché
                cache.set(f"codigo_verificacion_{correo}", codigo_generado, timeout=300) # 5 minutos
                
                return Response(
                    {"mensaje": "Usuario creado (inactivo). SMS enviado. Esperando verificación.", "correo": correo}, 
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"error": "Error al enviar el SMS. Tu cuenta ha sido creada, pero requiere verificación."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerificarCodigoView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        correo = request.data.get('correo')
        codigo_usuario = request.data.get('codigo')
        
        if not correo or not codigo_usuario:
            return Response({"error": "Faltan datos."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Recuperamos el código de verificación de la caché
        codigo_guardado = cache.get(f"codigo_verificacion_{correo}")

        if not codigo_guardado:
            return Response(
                {"error": "El código ha caducado o no existe. Solicita otro."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Comparamos el código introducido con el guardado
        if str(codigo_guardado) == str(codigo_usuario):
            # 3. ACTIVAMOS AL USUARIO EN LA BBDD
            try:
                usuario = Usuarios.objects.get(correo=correo)
                usuario.cuenta_activa = True
                usuario.save()
                
                # Borramos la evidencia de la RAM
                cache.delete(f"codigo_verificacion_{correo}") 
                
                # 4. AUTO-LOGIN: Generamos tokens para iniciar sesión directamente tras verificar SMS
                refresh = RefreshToken()
                # ¡IMPORTANTE: TIENE QUE LLAMARSE user_id PARA QUE SIMPLE_JWT LO ENTIENDA!
                refresh['user_id'] = usuario.id_usuario 
                refresh['nombre'] = usuario.nombre
                refresh['correo'] = usuario.correo
                
                return Response({
                    "mensaje": "Identidad verificada. Cuenta activada con éxito.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "nombre": usuario.nombre,
                    "usuario_id": usuario.id_usuario
                }, status=status.HTTP_200_OK)
            
            except Usuarios.DoesNotExist:
                return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "El código es incorrecto."}, status=status.HTTP_400_BAD_REQUEST)


class LoginUsuarioView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        correo_recibido = request.data.get('correo')
        contrasena_recibida = request.data.get('contrasena')
        
        if not correo_recibido or not contrasena_recibida:
            return Response({"error": "Correo y contraseña son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuarios.objects.get(correo=correo_recibido)
        except Usuarios.DoesNotExist:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        # VALIDACIÓN EXTRA: Bloqueamos si la cuenta no ha sido verificada por SMS
        if not usuario.cuenta_activa:
            return Response({
                "error": "Tu cuenta aún no está verificada. Por favor, verifica el código SMS."
            }, status=status.HTTP_403_FORBIDDEN)

        if check_password(contrasena_recibida, usuario.contrasena):
            refresh = RefreshToken()
            # ¡CORREGIDO! De usuario_id a user_id
            refresh['user_id'] = usuario.id_usuario
            refresh['nombre'] = usuario.nombre
            refresh['correo'] = usuario.correo

            return Response({
                "mensaje": "Login exitoso",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "nombre": usuario.nombre,
                "usuario_id": usuario.id_usuario
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"error": "Refresh token es requerido."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "mensaje": "Token refrescado correctamente"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Refresh token inválido o expirado: {str(e)}"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({"error": "Refresh token es requerido para hacer logout."}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"mensaje": "Logout exitoso. Token invalidado."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error al hacer logout: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)