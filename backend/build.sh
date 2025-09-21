#!/bin/bash

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
npm i

# Cambiar al directorio del frontend e instalar dependencias
echo "Instalando dependencias del frontend..."
cd ../frontend/
npm i

echo "Instalación completada."

# Volver al directorio del backend para el deploy
cd ../backend/

echo "Deploy configurado. El servidor se iniciará con npm start."
