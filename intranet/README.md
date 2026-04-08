# Intranet CAS — Servidor PHP

## Teknología

Este proyecto corre **100% en PHP + Apache (XAMPP)**. Ya no requiere Node.js, Express ni MongoDB.

## Requisitos

- XAMPP (Apache + PHP 8.1+)
- Carpeta del proyecto en: `C:\xampp\htdocs\CAS\intranet_CAS\intranet\`

## Cómo iniciar

1. Iniciar **Apache** en el Panel de Control de XAMPP.
2. Abrir el navegador en: `http://localhost/CAS/intranet_CAS/intranet/`
3. Panel de administración: `http://localhost/CAS/intranet_CAS/intranet/administracion/login.html`

## Credenciales por defecto

Las credenciales del administrador están en `default_user.json`.

## Estructura de la API

Todos los endpoints de la API se enrutan a través de `api.php` usando el `.htaccess`.
El `script.js` y `admin-logic.js` continúan usando las mismas rutas `/api/*` sin cambios.

| Módulo           | Ruta                       | Almacenamiento       |
|------------------|----------------------------|----------------------|
| Noticias         | `/api/news`                | `data/noticias.json` |
| Eventos          | `/api/eventos`             | `data/eventos.json`  |
| Banner           | `/api/banner`              | `data/banner.json`   |
| Directorio       | `/api/directorio`          | `data/directorio.json`|
| SGI (todos)      | `/api/sgi/{section}`       | HTML-DB              |
| RESPEL           | `/api/respel/{section}`    | JSON por sección     |
| RUA              | `/api/rua`                 | JSON                 |
| PCB              | `/api/pcb`                 | HTML-DB + JSON tabla |
| Informe Gestión  | `/api/informe-gestion`     | HTML-DB              |
| Talento Humano   | `/api/manual-funciones`, etc. | HTML-DB           |
| Búsqueda         | `/api/search?q=`           | Universal Crawler    |
| Usuarios         | `/api/users`               | `default_user.json`  |
| Auth             | `/api/auth/login|logout|check` | PHP Session      |
