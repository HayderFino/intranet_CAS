# Intranet CAS — Servidor PHP

## Tecnología

Este proyecto corre **100% en PHP + Apache**. Ya no requiere Node.js, Express ni MongoDB.

## Requisitos

- PHP 8.1+
- Apache (XAMPP o Laragon)
- Proyecto disponible dentro del `www`/`htdocs` local

## Entorno local recomendado (Laragon)

Si vas a trabajar en **local de pruebas personales** con Laragon (ya endurecido en seguridad), usa una configuración simple:

1. Clona el repositorio en `C:\laragon\www\intranet_CAS\`.
2. Levanta Apache desde Laragon.
3. Abre en navegador: `http://localhost/intranet_CAS/intranet/`.
4. Panel admin: `http://localhost/intranet_CAS/intranet/administracion/login.html`.

> Nota: no se requiere base de datos externa para la operación actual, porque la persistencia se maneja en archivos JSON/HTML locales.

## Variables de entorno (.env)

El proyecto funciona sin `.env`, pero para separar configuración local puedes crear un archivo `.env` **solo con valores básicos**:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost/intranet_CAS/intranet
TZ=America/Bogota
```

Recomendaciones:

- No subas `.env` al repositorio.
- Si activas logs de PHP, manténlos solo en entorno local.
- Evita exponer rutas internas en mensajes de error en pantallas públicas.

## Credenciales por defecto

Las credenciales del administrador están en `default_user.json`.

## Estructura de la API

Todos los endpoints de la API se enrutan a través de `api.php` usando el `.htaccess`.
El `script.js` y `admin-logic.js` continúan usando las mismas rutas `/api/*` sin cambios.

| Módulo           | Ruta                       | Almacenamiento        |
|------------------|----------------------------|-----------------------|
| Noticias         | `/api/news`                | `data/noticias.json`  |
| Eventos          | `/api/eventos`             | `data/eventos.json`   |
| Banner           | `/api/banner`              | `data/banner.json`    |
| Directorio       | `/api/directorio`          | `data/directorio.json`|
| SGI (todos)      | `/api/sgi/{section}`       | HTML-DB               |
| RESPEL           | `/api/respel/{section}`    | JSON por sección      |
| RUA              | `/api/rua`                 | JSON                  |
| PCB              | `/api/pcb`                 | HTML-DB + JSON tabla  |
| Informe Gestión  | `/api/informe-gestion`     | HTML-DB               |
| Talento Humano   | `/api/manual-funciones`, etc. | HTML-DB            |
| Búsqueda         | `/api/search?q=`           | Universal Crawler     |
| Usuarios         | `/api/users`               | `default_user.json`   |
| Auth             | `/api/auth/login\|logout\|check` | PHP Session   |
