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

El sistema está basado en el patrón **MVC (Model-View-Controller)** con persistencia híbrida.

### Tecnologías Core
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend**: Node.js con el framework Express.
- **Gestión de Datos**:
  - **MongoDB**: Para datos estructurados dinámicos (Noticias, Agenda).
  - **Sistema de Archivos Local**: Para activos binarios (PDFs, Imágenes, .docx) en `/data`.
  - **HTML-as-DB**: Para secciones de documentos SGI/RESPEL/RUA/PCB donde la vista y el dato están vinculados.
- **Motor de Búsqueda**: `UniversalCrawler` — rastrea automáticamente todas las carpetas de la intranet.

### Estructura de Directorios Principal
```text
/intranet                        ← Raíz de la aplicación
├── /administracion              ← Panel de control unificado
├── /data                        ← Repositorio central de activos y documentos
│   └── /menu header
│       ├── /sgi                 ← Documentos institucionales, procesos SGI
│       ├── /git                 ← Boletines, manuales de usuario, normativa GIT
│       ├── /MECI                ← Documentos anticorrupción y MECI
│       └── /la cas              ← Documentos CAS
├── /header_menu                 ← Páginas HTML por sección (cas, sgi, git)
├── /herramientas                ← RESPEL, RUA, PCB, búsqueda, cartografía
├── /src
│   ├── /controllers             ← Lógica de negocio
│   ├── /models                  ← Modelos de datos y crawlers
│   └── /routes                  ← Rutas API REST
├── server.js                    ← Punto de entrada del servidor
└── package.json
```

---

## 3. Motor de Búsqueda Universal ⭐ NUEVO

### 3.1. Descripción
El sistema cuenta con un **motor de búsqueda que indexa automáticamente toda la intranet**. No requiere configuración manual: detecta nuevos archivos por sí solo.

### 3.2. Componentes
| Archivo | Función |
|:--------|:--------|
| `src/models/universalCrawler.js` | Rastrea archivos físicos y links en HTML; mantiene índice con caché de 60 seg |
| `src/controllers/searchController.js` | Orquesta todas las fuentes de datos para búsqueda |
| `herramientas/busqueda.html` | Interfaz de búsqueda avanzada del usuario |
| `herramientas/search-logic.js` | Lógica frontend: búsqueda en tiempo real, resaltado de términos |

### 3.3. Fuentes Indexadas
El buscador consulta **7 fuentes en paralelo**:

1. **Noticias** (MongoDB) — publicadas en NotiCAS
2. **Informes de Gestión** — documentos HTML
3. **Modelos estructurados** — CITA, SIRH, SNIF, Boletines, Manual Funciones, Planes, Convocatorias, Estudios Técnicos, Provisión de Empleos, RESPEL, RUA, PCB, Manuales SGI, Revisión de Red
4. **SGI completo** — todas las secciones (planeación, mejora, talento humano, contratación, jurídico, etc.)
5. **Agenda** — actividades institucionales
6. **🆕 Crawler Universal** — escanea TODAS las carpetas `/data/` y TODOS los HTML de `/header_menu/`
7. **Índice de navegación** — más de 60 páginas catalogadas con palabras clave en español

### 3.4. Comportamiento de la Caché
- Al **iniciar el servidor**: el índice se construye en la primera búsqueda
- **Actualización automática cada 60 segundos**: el crawler re-escanea todas las carpetas
- **Invalidación inmediata**: cualquier `POST/PUT/DELETE` exitoso desde `/api/` invalida el índice → el nuevo archivo aparece en la siguiente búsqueda sin esperar 60 segundos
- **Sin reinicio necesario**: agregar un archivo nuevo a `/data/` ya lo hace buscable en máximo 60 segundos

### 3.5. Tipos de Búsqueda
- **Texto libre**: divide la consulta en palabras y exige que TODAS coincidan (búsqueda AND)
- **Páginas de navegación**: busca por palabras clave predefinidas (búsqueda OR)
- **Resaltado**: los términos buscados aparecen marcados en amarillo en los resultados
- **Búsqueda en tiempo real**: resultados desde los 2 caracteres mientras se escribe (debounce 350ms)

---

## 4. Gestión de Procesos y Datos

### 4.1. Centralización de Activos (`/data`)
Todos los archivos físicos (PDFs, Word, Excel, imágenes) se gestionan en la carpeta `/data/menu header/`. El servidor Node.js sirve esta carpeta de forma estática. El `UniversalCrawler` la escanea completamente para indexar su contenido en la búsqueda.

### 4.2. Panel de Administración
Acceso: `http://localhost:3000/administracion`

Módulos integrados:
1. **NotiCAS**: Noticias institucionales en MongoDB con carga de imágenes.
2. **Agenda CAS**: Programación de eventos en MongoDB.
3. **SGI**: Gestión de documentos por sección (CRUD + upload de archivos a las carpetas de datos).
4. **RESPEL / RUA / PCB**: Actualización de registros ambientales.
5. **Boletines GIT**: Publicación de boletines de seguridad.
6. **Manuales SGI**: Gestión de manuales del SGI.
7. **Manuales CITA / SIRH / SNIF / Revisión de Red**: Carga de manuales de usuario.
8. **Manual de Funciones**: Gestión del manual de funciones y competencias.
9. **Plan Monitoreo / Planes Talento / Convocatorias / Estudios Técnicos / Provisión de Empleos**: Módulos de Talento Humano.

### 4.3. Ciclo de Vida de un Archivo Nuevo
```
Administrador sube archivo desde panel
    ↓
Multer guarda el archivo en /data/menu header/...
    ↓
El controlador registra el link en el HTML correspondiente
    ↓
Middleware en server.js detecta la respuesta exitosa → UniversalCrawler.invalidate()
    ↓
La próxima búsqueda reconstruye el índice → el archivo ya aparece
```

---

## 5. Diseño y Experiencia de Usuario (UX/UI)

- **Navegación**: Sidebar lateral + menú superior desplegable con submenús.
- **Búsqueda Integrada**: Barra en el header (redirige a `/herramientas/busqueda.html?q=...`). Búsqueda avanzada con filtros por categoría y fecha.
- **Resultados Enriquecidos**: Cards con ícono por tipo, badge de categoría con color, resaltado del término buscado, animación de entrada.
- **Tipografía**: Fuente 'Inter' (Google Fonts).
- **Sistema de color**: Variables CSS centralizadas en `styles.css`.

---

## 6. Ejecución del Servidor

```powershell
# Desde la carpeta /intranet/intranet
npm install        # Solo la primera vez o tras cambios de dependencias
npm start          # Inicia el servidor en http://localhost:3000
```

> [!IMPORTANT]
> Asegúrese de que el servicio de **MongoDB** esté iniciado antes de arrancar el servidor.
> Los usuarios finales de la red solo necesitan abrir su navegador y navegar a `http://[IP_SERVIDOR]:3000`.

---

## 7. Evolución del Proyecto (Roadmap)

| Fase | Título | Descripción |
| :--- | :--- | :--- |
| **Fase 1–3** | Base Estática | Estructura HTML, CSS, menús y diseño inicial. |
| **Fase 4** | Documentación Maestra | Manuales técnicos y operativos iniciales. |
| **Fase 5** | Migración NoSQL | MongoDB para Noticias y Agenda. |
| **Fase 6** | CRUD CITA | Administración completa para manuales CITA. |
| **Fase 7** | Módulos de Archivos | CRUD para SNIF, Provisión de Empleos y Revisión de Red. |
| **Fase 8** | Talento Humano y UX | Convocatorias, Planes, Estudios Técnicos y mejoras de interfaz. |
| **Fase 9** | Botón Login Generalizado | Ruta `/administracion/login.html` unificada en todas las páginas. |
| **Fase 10** | Motor de Búsqueda Universal | `UniversalCrawler`, indexación automática de todas las carpetas, invalidación de caché en tiempo real. |

---

> [!IMPORTANT]
> **Respaldo de Base de Datos**: Es crítico realizar dumps periódicos de MongoDB (`mongodump`) además del respaldo de la carpeta `/data`.

> [!TIP]
> **Nuevos Módulos**: Para agregar una nueva sección al buscador, simplemente copie los archivos a las subcarpetas de `/data/menu header/` — el `UniversalCrawler` los detectará automáticamente en la próxima búsqueda.
