# MediAgenda - Backend

## Descripción
MediAgenda es una aplicación diseñada para gestionar citas médicas de manera eficiente.

## Arquitectura y Tecnologías
* Entorno: Node.js / Express.js
* Base de Datos: Firebase Firestore (NoSQL)
* Autenticación: JSON Web Tokens (JWT) y Firebase 

## Requisitos Previos
* Node.js (v18 o superior)
* NPM o Yarn
* Proyecto de Firebase configurado (con Firestore habilitado)


## Configuración de Variables de Entorno (.env)
Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables:


## Variables de entorno 
```text
# Servidor
PORT=3000

# JWT
JWT_SECRET=clave_bien_secreta_lol
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=XXXX
FIREBASE_CLIENT_EMAIL=XXX
FIREBASE_PRIVATE_KEY="XXXX"

# CORS
CORS_ORIGIN=http://localhost:4000
```


## Instalación y Ejecución

1. Clonar el repositorio y entrar a la carpeta:
git clone https://github.com/Cloneeu/proyecto-final-lenguajes.git
cd backend-medi-agenda

En otra terminal 
cd fronted-medi-agenda


2. Instalar dependencias:

npm install


3. Correr el servidor tanto en backend como en fronted

npm run dev

