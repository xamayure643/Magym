from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegistroUsuarioSerializer
from .services import enviar_sms_bienvenida

class RegistroUsuarioView(APIView):
    def post(self, request):
        # Pasamos los datos que llegan desde el Frontend al Serializador
        serializer = RegistroUsuarioSerializer(data=request.data)
        
        # Si los datos cumplen con el modelo (ej. el correo no está duplicado)
        if serializer.is_valid():
            usuario_guardado = serializer.save() # Aquí se ejecuta el create() de tu serializador
            telefono_real = request.data.get('telefono')
            nombre = request.data.get('nombre')

            enviar_sms_bienvenida(telefono_real, nombre)
            return Response(
                {"mensaje": "Usuario registrado de forma segura. SMS de bienvenida en camino."}, 
                status=status.HTTP_201_CREATED
            )
            
        # Si hay un error (ej. falta el nombre), devolvemos el fallo
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)