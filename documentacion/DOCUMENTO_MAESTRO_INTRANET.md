# Documento Maestro de la Intranet CAS
## Análisis Integral, Arquitectura y Gestión de Procesos

Este documento constituye la documentación oficial y técnica del portal de Intranet de la **Corporación Autónoma Regional de Santander (CAS)**. Ha sido diseñado para servir como guía de administración, mantenimiento y desarrollo futuro del sistema.

---

## 1. Introducción y Propósito

El portal de Intranet CAS es una plataforma centralizada diseñada para facilitar el acceso a la información institucional, la gestión de procesos del Sistema de Gestión Integrado (SGI), la administración de manuales de usuario (CITA, SIRH, SNIF), y la comunicación interna.

**Objetivos clave:**
- Centralizar el acceso a documentos normativos, manuales y formatos.
- Automatizar la publicación de noticias institucional (NotiCAS).
- Ofrecer un punto único de acceso a herramientas transversales (RESPEL, RUA, PCB, Cartografía, etc.).
- Proveer un **motor de búsqueda universal** que indexe todos los documentos y páginas de la intranet de forma automática.
- Mantener una estética moderna y profesional.

---

## 2. Arquitectura Técnica

El sistema está basado en una arquitectura **PHP puro sobre Apache/XAMPP**, sin dependencias de Node.js ni bases de datos externas.

### Tecnologías Core
| Capa | Tecnología |
|:-----|:-----------|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| **Backend** | PHP 8.x sobre Apache (XAMPP) |
| **Persistencia** | Archivos JSON planos en `/data/` |
| **Configuración** | Apache `.htaccess` con mod_rewrite |
| **Servidor local** | XAMPP (Apache + PHP) |

**❌ No se utiliza:** Node.js, Express, MongoDB, npm, ni ninguna base de datos externa.

### Patrón de Persistencia: NoSQL Estático (JSON-as-DB)
- **JSON planos** en `/data/*.json` para noticias, eventos, agenda, banner, directorio y usuarios.
- **HTML-as-DB** para secciones SGI, RESPEL, PCB y otros módulos (los documentos se almacenan como nodos HTML con `data-id` dentro de archivos HTML estáticos).
- **Sistema de archivos** para activos binarios (PDFs, imágenes, Word) en `/data/menu header/`.

### Estructura de Directorios Principal
```text
/intranet                        ← Raíz de la aplicación web
├── .htaccess                    ← Enrutamiento de /api/* hacia api.php
├── api.php                      ← Punto de entrada API REST
├── api/                         ← Arquitectura Modular de la API
│   ├── core/                    ← Enrutador, Helpers y Lógica de Auth
│   └── modules/                 ← Módulos (auth, sgi, meci, search, etc.)
├── default_user.json            ← Usuarios del sistema (contraseñas con bcrypt)
├── index.html                   ← Página principal de la intranet
├── meci.html                    ← Módulo MECI
├── script.js                    ← Lógica JS del frontend principal
├── styles.css                   ← Sistema de diseño centralizado
│
├── /administracion              ← Panel de control unificado
│   ├── index.html               ← Panel principal (protegido por sesión PHP)
│   ├── login.html               ← Formulario de autenticación
│   ├── admin-logic.js           ← Motor JS del panel
│   ├── admin-styles.css         ← Estilos del panel
│   └── [módulo]-admin.js        ← Lógica por módulo (banner, cita, sgi, etc.)
│
├── /data                        ← Repositorio central de datos y activos
│   ├── noticias.json            ← Noticias NotiCAS
│   ├── eventos.json             ← Eventos institucionales
│   ├── agenda.json              ← Agenda CAS
│   ├── banner.json              ← Gestión del banner pasarela
│   ├── directorio.json          ← Directorio institucional
│   ├── /imagenes                ← Imágenes subidas por el panel
│   ├── /Herramientas            ← Datos de RESPEL, RUA, PCB (JSON + archivos)
│   ├── /Talento humano          ← Documentos de talento humano
│   └── /menu header             ← Documentos SGI, GIT, CAS (PDFs, Word)
│       ├── /sgi                 ← Documentos Sistema de Gestión Integrado
│       ├── /git                 ← Boletines, manuales CITA/SIRH/SNIF
│       ├── /la cas              ← Informe de Gestión, Manual de Funciones, Talento
│       └── /MECI                ← Documentos MECI y anticorrupción
│
├── /header_menu                 ← Páginas HTML por sección (vistas de contenido)
│   ├── /cas                     ← Páginas CAS (noticias, informe gestión, talento)
│   ├── /sgi                     ← Páginas SGI por proceso
│   └── /git                     ← Páginas GIT (boletines, manuales usuario)
│
└── /herramientas                ← RESPEL, RUA, PCB, búsqueda, cartografía
    ├── busqueda.html            ← Interfaz del motor de búsqueda
    ├── search-logic.js          ← Lógica frontend de búsqueda
    ├── pcb.html                 ← Módulo PCB (HTML-as-DB)
    └── ...
```

---

## 3. Motor de Búsqueda Universal

### 3.1. Descripción
El sistema cuenta con un **motor de búsqueda implementado en PHP** dentro de `api.php`. No requiere configuración manual ni procesos externos: en cada consulta escanea en tiempo real los archivos del sistema.

### 3.2. Componentes
| Archivo | Función |
|:--------|:--------|
| api.php | Punto de entrada: carga el núcleo y los módulos |
| api/core/router.php | Enrutador modular con soporte para parámetros dinámicos |
| api/modules/search.php | Buscador PHP: escanea JSON, archivos HTML y carpetas físicas |
| `herramientas/busqueda.html` | Interfaz de búsqueda avanzada del usuario |
| `herramientas/search-logic.js` | Lógica frontend: búsqueda en tiempo real, resaltado de términos |

### 3.3. Fuentes Indexadas
El buscador consulta **3 fuentes** en cada petición:

1. **Noticias** — Lee `data/noticias.json` directamente.
2. **Archivos HTML** — Escanea `header_menu/cas`, `header_menu/sgi`, `header_menu/git`, `herramientas` buscando elementos `.file-item` y `.pdf-folder-card`.
3. **Archivos físicos** — Recorre recursivamente `data/menu header`, `data/Talento humano`, `data/Herramientas` buscando PDF, DOCX, XLSX, etc.

### 3.4. Tipos de Búsqueda
- **Texto libre**: búsqueda por subcadena (`strpos` PHP) en nombre y descripción
- **Filtro por categoría**: `all`, `noticia`, `sgi`, `git`, `herramienta`, `pdf`, `docx`
- **Filtro por fecha**: por rango `startDate` / `endDate`
- **Resaltado**: los términos buscados aparecen marcados en los resultados (JS frontend)
- **Búsqueda en tiempo real**: resultados desde los 2 caracteres (debounce 350ms)
- **Límite de resultados**: máximo 50 resultados por consulta

---

## 4. Gestión de Procesos y Datos

### 4.1. Centralización de Activos (`/data`)
Todos los archivos físicos (PDFs, Word, Excel, imágenes) viven en `/data/`. Apache sirve esta carpeta de forma estática. El buscador PHP la recorre en cada consulta.

### 4.2. Panel de Administración
Acceso: `http://localhost/CAS/intranet_CAS/intranet/administracion/login.html`

Autenticación: sesión PHP (`$_SESSION`) + contraseñas hasheadas con **bcrypt** (`password_hash` / `password_verify`).

Módulos integrados:
| # | Módulo | Ruta API | Persistencia |
|:--|:-------|:---------|:-------------|
| 1 | **NotiCAS** | `POST /api/news` | `data/noticias.json` |
| 2 | **Eventos** | `POST /api/eventos` | `data/eventos.json` |
| 3 | **Agenda CAS** | `POST /api/agenda` | `data/agenda.json` |
| 4 | **Banner Pasarela** | `POST /api/banner` | `data/banner.json` |
| 5 | **Directorio** | `POST /api/directorio` | `data/directorio.json` |
| 6 | **SGI** (22 secciones) | `POST /api/sgi/{section}` | HTML-as-DB en `header_menu/sgi/` |
| 7 | **RESPEL** (4 sub-secciones) | `POST /api/respel/{section}` | `data/Herramientas/RESPEL/{section}.json` |
| 8 | **RUA** | `POST /api/rua` | `data/Herramientas/Rua/rua.json` |
| 9 | **PCB** | `POST /api/pcb` | HTML-as-DB en `herramientas/pcb.html` |
| 10 | **Informe de Gestión** | `POST /api/informe-gestion` | Archivos físicos en `data/menu header/la cas/Informe de Gestión/` |
| 11 | **Manual de Funciones** | `POST /api/manual-funciones` | Archivos en `data/menu header/la cas/talento humano/` |
| 12 | **Manuales SGI** | `POST /api/manuales-sgi` | Archivos en `data/menu header/sgi/manuales/` |
| 13 | **Boletines GIT** | `POST /api/boletines` | Archivos en `data/menu header/git/boletines/` |
| 14 | **CITA / SIRH / SNIF** | `POST /api/cita` etc. | Archivos en `data/menu header/git/manuales usuario/` |
| 15 | **Revisión de Red** | `POST /api/revision-red` | Archivos en `data/menu header/git/manuales usuario/Revision Red/` |
| 16 | **Plan Monitoreo SIGEP** | `POST /api/plan-monitoreo` | Archivos en `data/menu header/la cas/talento humano/` |
| 17 | **Planes Talento / Convocatorias / Estudios / Provisión** | `POST /api/planes-talento` etc. | Archivos en `data/menu header/la cas/talento humano/` |
| 18 | **Políticas SGI** | `POST /api/politicas-sgi` | Archivos en `data/menu header/sgi/Politicas/` |
| 19 | **Gestión de Usuarios** | `POST /api/users` | `default_user.json` |

### 4.3. Ciclo de Vida de un Archivo Nuevo
```
Administrador sube archivo desde panel web
    ↓
PHP api.php recibe la petición multipart/form-data
    ↓
move_uploaded_file() guarda el file en /data/menu header/...
    ↓
api.php actualiza el HTML correspondiente (HTML-as-DB)
  – O bien –
api.php escribe la referencia en metadata.json
    ↓
En la próxima búsqueda, el archivo ya es visible (scan en tiempo real)
```

---

## 5. API REST — Referencia Rápida

Todas las rutas pasan por: `http://localhost/CAS/intranet_CAS/intranet/api.php?route={ruta}`

Gracias al `.htaccess` con `mod_rewrite`, se puede acceder también como:
`http://localhost/CAS/intranet_CAS/intranet/api/{ruta}`

### Endpoints Principales

| Método | Ruta | Descripción | Auth |
|:-------|:-----|:------------|:----:|
| POST | `auth/login` | Iniciar sesión | No |
| GET | `auth/check` | Verificar sesión activa | No |
| GET | `auth/logout` | Cerrar sesión | No |
| GET | `news` | Listar noticias | No |
| POST | `news` | Crear noticia | ✓ |
| POST | `news/upload` | Subir imagen noticia | ✓ |
| DELETE | `news/{id}` | Eliminar noticia | ✓ |
| GET | `eventos` | Listar eventos | No |
| POST | `eventos` | Crear evento | ✓ |
| GET | `agenda` | Listar agenda | No |
| POST | `agenda` | Crear ítem agenda | ✓ |
| GET | `banner` | Listar banners | No |
| POST | `banner` | Crear banner | ✓ |
| POST | `banner/upload` | Subir imagen banner | ✓ |
| GET | `directorio` | Listar directorio | No |
| POST | `directorio` | Agregar contacto | ✓ |
| GET | `sgi/{seccion}` | Listar docs SGI por sección | No |
| POST | `sgi/{seccion}` | Agregar doc a sección SGI | ✓ |
| POST | `sgi/upload` | Subir doc SGI | ✓ |
| GET | `informe-gestion` | Listar informes de gestión | No |
| POST | `informe-gestion/upload` | Subir informe de gestión | ✓ |
| GET | `respel/{seccion}` | Listar RESPEL | No |
| POST | `respel/{seccion}` | Crear entrada RESPEL | ✓ |
| GET | `rua` | Listar RUA | No |
| POST | `rua` | Crear entrada RUA | ✓ |
| GET | `pcb` | Listar PCB | No |
| POST | `pcb` | Crear PCB | ✓ |
| GET | `search?q=texto` | Buscar en toda la intranet | No |
| GET | `users` | Listar usuarios | ✓ (superadmin) |
| POST | `users` | Crear usuario | ✓ (superadmin) |
| GET | `test-server` | Health check del servidor | No |

---

## 6. Diseño y Experiencia de Usuario (UX/UI)

- **Navegación**: Sidebar lateral + menú superior desplegable con submenús.
- **Búsqueda Integrada**: Barra en el header (redirige a `/herramientas/busqueda.html?q=...`). Búsqueda avanzada con filtros por categoría y fecha.
- **Resultados Enriquecidos**: Cards con ícono por tipo, badge de categoría con color, resaltado del término buscado, animación de entrada.
- **Tipografía**: Fuente 'Inter' (Google Fonts).
- **Sistema de color**: Variables CSS centralizadas en `styles.css`.

---

## 7. Ejecución del Servidor

> [!IMPORTANT]
> Este proyecto **no requiere Node.js, npm ni MongoDB**. Solo necesita XAMPP con Apache y PHP.

### Pasos para poner en marcha:

1. Instalar **XAMPP** desde [https://www.apachefriends.org](https://www.apachefriends.org)
2. Colocar el proyecto en `C:\xampp\htdocs\CAS\intranet_CAS\`
3. Iniciar **Apache** desde el Panel de Control de XAMPP
4. Navegar a: `http://localhost/CAS/intranet_CAS/intranet/`

El panel de administración está en:
`http://localhost/CAS/intranet_CAS/intranet/administracion/login.html`

---

## 8. Sistema de Autenticación

- **Mecanismo**: Sesiones PHP (`session_start()`, `$_SESSION`)
- **Hash de contraseñas**: `password_hash()` con `PASSWORD_BCRYPT`
- **Verificación**: `password_verify()` en cada login
- **Archivo de usuarios**: `default_user.json` (NO utiliza base de datos)
- **Roles**: `superadmin` (acceso total), `admin` (acceso según permisos)
- **Permisos granulares**: 28 módulos configurables por usuario individual

---

## 9. Evolución del Proyecto (Roadmap)

| Fase | Título | Descripción |
| :--- | :--- | :--- |
| **Fase 1–3** | Base Estática | Estructura HTML, CSS, menús y diseño inicial. |
| **Fase 4** | Documentación Maestra | Manuales técnicos y operativos iniciales. |
| **Fase 5** | Backend Node.js (deprecado) | MongoDB + Express (ya no se usa). |
| **Fase 6–8** | Módulos CRUD | Administración de manuales, talento humano y mejoras UX. |
| **Fase 9** | Login Generalizado | Ruta `/administracion/login.html` unificada. |
| **Fase 10** | Motor de Búsqueda Universal | Buscador automático de documentos e indexación. |
| **Fase 11** | **Migración a PHP** ✅ | Eliminación completa de Node.js; API unificada en `api.php`; persistencia en JSON + archivos; autenticación con sesiones PHP y bcrypt. |

---

> [!TIP]
> **Nuevos Módulos**: Para agregar una nueva sección al buscador, copie los archivos a las subcarpetas de `/data/menu header/` — el motor PHP los detectará automáticamente en la próxima búsqueda sin ningún reinicio.

> [!IMPORTANT]
> **Respaldo**: Realice copias periódicas de la carpeta `/data/` completa y del archivo `default_user.json`, ya que contienen toda la información dinámica del sistema.
