# 1. Usamos Node.js para compilar React
FROM node:20-slim

# 2. Directorio de trabajo
WORKDIR /app

# 3. Instalamos dependencias
COPY package*.json ./
RUN npm install

# 4. Copiamos el código
COPY . .

# 5. Exponemos el puerto de Vite (el que usas en el navegador)
EXPOSE 5173

# 6. Arrancamos en modo desarrollo con host abierto para que Docker lo vea
CMD ["npm", "run", "dev", "--", "--host"]