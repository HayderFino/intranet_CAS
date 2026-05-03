# Intranet CAS

Portal de intranet institucional de la **Corporación Autónoma Regional de Santander (CAS)**.

---

## Stack Tecnológico

| Capa | Tecnología |
|:-----|:-----------|
| Servidor | Apache (XAMPP) |
| Backend | PHP 8.x — `api.php` (controlador único) |
| Frontend | HTML5 · CSS3 Vanilla · JavaScript ES6+ |
| Persistencia | JSON planos + Sistema de archivos |
| Arquitectura | Modular (Router + Módulos especializados) |
| Autenticación | Sesiones PHP + bcrypt |

> **No se requiere** Node.js, npm, MongoDB ni ninguna base de datos.

---

## Inicio Rápido

### Requisitos
- [XAMPP](https://www.apachefriends.org) con Apache activo
- `mod_rewrite` habilitado en Apache (`AllowOverride All` en `httpd.conf`)

### Instalación

```bash
# Clonar en la carpeta htdocs de XAMPP
cd C:\xampp\htdocs\CAS
git clone https://github.com/HayderFino/intranet_CAS.git
```

1. Iniciar **Apache** desde el Panel de Control de XAMPP
2. Abrir en el navegador:

```
http://localhost/CAS/intranet_CAS/intranet/
```

### Panel de Administración

```
http://localhost/CAS/intranet_CAS/intranet/administracion/login.html
```

| Usuario | Contraseña | Rol |
|:--------|:-----------|:----|
| `Admin` | `1234` | superadmin |

> ⚠️ Cambiar la contraseña por defecto en el primer acceso desde **Gestión de Usuarios**.

---

## Estructura del Proyecto

```
intranet_CAS/
├── documentacion/           ← Documentación técnica y operativa
└── intranet/                ← Aplicación web
    ├── .htaccess            ← Enrutamiento /api/* → api.php
    ├── api.php              ← Punto de entrada API REST
    ├── api/                 ← Núcleo de la API (Modular)
    │    ├── core/           ← Router, Helpers y Autenticación
    │    └── modules/        ← Módulos especializados (SGI, MECI, etc.)
    ├── default_user.json    ← Usuarios (contraseñas bcrypt)
    ├── index.html           ← Página principal
    ├── script.js            ← Lógica JS del portal
    ├── styles.css           ← Sistema de diseño
    ├── administracion/      ← Panel de gestión de contenidos
    ├── data/                ← Datos JSON + archivos físicos (PDFs, imágenes)
    ├── header_menu/         ← Vistas HTML por sección (SGI, GIT, CAS)
    └── herramientas/        ← RESPEL, RUA, PCB, Búsqueda, Cartografía
```

---

## Módulos del Sistema

| Módulo | Descripción |
|:-------|:------------|
| **NotiCAS** | Noticias institucionales |
| **Agenda / Eventos** | Programación de actividades |
| **Banner Pasarela** | Carrusel de imágenes del portal |
| **SGI** | Sistema de Gestión Integrado (22 secciones) |
| **RESPEL / RUA / PCB** | Módulos de gestión ambiental |
| **Informe de Gestión** | PDFs del informe anual institucional |
| **Talento Humano** | Convocatorias, planes, estudios, provisión de empleos |
| **Manuales GIT** | CITA, SIRH, SNIF, Revisión de Red, Boletines |
| **Directorio** | Directorio de contactos institucionales |
| **Búsqueda Universal** | Motor de búsqueda PHP sobre documentos y páginas |
| **Gestión de Usuarios** | Administración de cuentas y permisos (superadmin) |

---

## API — Health Check

```
http://localhost/CAS/intranet_CAS/intranet/api/test-server
```

Respuesta esperada: `{ "status": "ok", "engine": "PHP" }`

---

## Respaldo

Toda la información dinámica está en archivos — sin base de datos:

```powershell
# Copiar datos y usuarios
xcopy "C:\xampp\htdocs\CAS\intranet_CAS\intranet\data" "D:\Backup\data\" /E /I /Y
copy  "C:\xampp\htdocs\CAS\intranet_CAS\intranet\default_user.json" "D:\Backup\"
```

---

## Documentación

Ver carpeta [`/documentacion/`](./documentacion/README.md) para manuales técnicos y operativos completos.
