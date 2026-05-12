# 1. Usamos una imagen de Python oficial y ligera
FROM python:3.12-slim

# 2. Evita que Python genere archivos .pyc y permite ver logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Instalamos dependencias del sistema necesarias para MySQL y criptografía
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 4. Creamos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 5. Instalamos las librerías de Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copiamos el resto del código
COPY . /app/

# 7. Exponemos el puerto de Django
EXPOSE 8000

# 8. Comando para arrancar el servidor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]