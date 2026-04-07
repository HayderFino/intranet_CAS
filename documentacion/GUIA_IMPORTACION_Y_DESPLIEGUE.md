# 🚀 Guía de Despliegue e Importación - Intranet Institucional

Esta guía explica paso a paso cómo poner en marcha el proyecto desde cero en un nuevo entorno.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

1.  **Node.js** (Versión 16 o superior)
2.  **MongoDB Community Server** (Corriendo localmente en un puerto por defecto: 27017)
3.  **Git** (Opcional, para clonar el repositorio)

---

## 🛠️ Paso 1: Instalación de Dependencias

Una vez descargado o clonado el proyecto, abre una terminal en la carpeta raíz (`/intranet`) y ejecuta:

```bash
npm install
```
*Esto instalará Express, Mongoose, Bcryptjs y todas las herramientas necesarias.*

---

## 🗄️ Paso 2: Migración e Inicialización de Datos

El proyecto incluye una base de datos "semilla" para que no inicies con la plataforma vacía. Para cargar los datos por defecto, ejecuta:

```bash
node migrate_to_mongo.js
```

**¿Qué hace este comando?**
1.  **Crea el Usuario Maestro**: Crea al usuario `Admin` (Contraseña: `1234`) con todos los permisos habilitados.
2.  **Migra Noticias**: Importa todas las noticias existentes desde el archivo JSON a MongoDB.
3.  **Configura Permisos**: Establece la estructura granular de los 28 módulos administrativos.

---

## ⚡ Paso 3: Lanzar la Aplicación

Para iniciar el servidor, ejecuta:

```bash
npm start
```
*Si estás en desarrollo y quieres que el servidor se reinicie solo al hacer cambios, usa `npm run dev`.*

La aplicación estará disponible en: **`http://localhost:3000`**

---

## 🔐 Acceso al Panel de Administración

Para gestionar los contenidos de la intranet:

1.  Ve a la ruta: `http://localhost:3000/administracion/login.html`
2.  **Usuario**: `Admin`
3.  **Contraseña**: `1234`

### 👤 Gestión de Usuarios
Dentro del panel, busca la opción **"Gestión de Usuarios"**. Desde allí podrás:
*   Crear nuevos usuarios (Prensa, Administradores, etc).
*   Asignar permisos específicos (Ej: que alguien solo pueda subir noticias pero no ver talento humano).
*   Eliminar o editar perfiles existentes.

---

## 📂 Estructura del Proyecto (Resumen)

*   `/src`: Lógica del servidor (Modelos, Controladores, Rutas).
*   `/administracion`: Interfaz y lógica del panel administrativo.
*   `/data`: Archivos JSON de respaldo y multimedia.
*   `default_user.json`: Backup del usuario administrador maestro.
*   `server.js`: Punto de entrada de la aplicación.

---

> [!IMPORTANT]
> **Seguridad**: Se recomienda cambiar la contraseña del usuario `Admin` inmediatamente después del primer login desde la sección de Gestión de Usuarios.
