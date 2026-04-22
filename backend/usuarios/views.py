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
        # 1. Validamos que los datos sean correctos (ej: contraseñas fuertes)
        serializer = RegistroUsuarioSerializer(data=request.data)
        
        if serializer.is_valid():
            # ¡ATENCIÓN! QUITAMOS EL serializer.save() DE AQUÍ
            
            telefono_real = request.data.get('telefono')
            correo = request.data.get('correo') 

            # Generamos y enviamos el SMS
            codigo_generado = enviar_sms_verificacion(telefono_real)
            
            if codigo_generado:
                # 2. GUARDAMOS EL FORMULARIO ENTERO Y EL CÓDIGO EN LA RAM
                datos_pendientes = {
                    'datos_usuario': request.data,
                    'codigo_otp': codigo_generado
                }
                cache.set(f"registro_pendiente_{correo}", datos_pendientes, timeout=300) # 5 minutos
                
                return Response(
                    {"mensaje": "Datos validados. SMS enviado. Esperando verificación.", "correo": correo}, 
                    status=status.HTTP_200_OK # Cambiamos a 200 porque aún no hemos "creado" nada
                )
            else:
                return Response(
                    {"error": "Error al enviar el SMS. Inténtalo de nuevo."}, 
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

        # 1. Recuperamos todo de la caché
        datos_pendientes = cache.get(f"registro_pendiente_{correo}")

        if not datos_pendientes:
            return Response(
                {"error": "El código ha caducado o no existe. Solicita otro."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Comparamos el código
        if str(datos_pendientes['codigo_otp']) == str(codigo_usuario):
            
            # 3. ¡AHORA SÍ! GUARDAMOS EN LA BASE DE DATOS
            serializer = RegistroUsuarioSerializer(data=datos_pendientes['datos_usuario'])
            if serializer.is_valid():
                serializer.save() # Se inserta en MySQL
                
                cache.delete(f"registro_pendiente_{correo}") # Borramos la evidencia de la RAM
                
                return Response({"mensaje": "Identidad verificada. Cuenta creada con éxito."}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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

        if check_password(contrasena_recibida, usuario.contrasena):
            refresh = RefreshToken()
            refresh['usuario_id'] = usuario.id_usuario
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