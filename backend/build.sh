#!/bin/bash

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
npm i
# Cambiar al directorio del frontend e instalar dependencias
echo "Instalando dependencias del frontend..."
cd ../frontend/
npm i

echo "Instalación completada."

# Volver al directorio del backend
cd ../backend/

echo "Iniciando servidor backend..."
# Inicia el backend en segundo plano
node src/server.js &

# Esperar 5 segundos para que el backend se inicie completamente
echo "Esperando a que el backend se inicie..."
sleep 5

# Cambiar al frontend e iniciarlo
echo "Iniciando servidor frontend..."
cd ../frontend/
node src/app.js