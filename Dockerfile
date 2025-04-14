FROM node:16

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias primero
COPY package.json package-lock.json /app/

RUN npm install

# Copiar el resto del código
COPY . /app

# Compilar el código TypeScript
RUN npm run build

# Exponer el puerto (3001 o el que desees)
EXPOSE 3001

# Ejecutar el servidor
CMD ["npm", "start"]
