# MANUAL TÉCNICO Y DE OPERACIÓN: INTRANET CAS
## 🏢 Corporación Autónoma Regional de Santander (CAS)
**Versión: 3.0.0 — Marzo 2026**

Este documento es la guía definitiva para la administración, mantenimiento y expansión del portal de Intranet de la CAS.

---

## 1. Resumen de Proyecto: ¿Qué se ha hecho?

El portal ha evolucionado a lo largo de 10 fases hacia una plataforma robusta y con búsqueda universal. Los principales hitos alcanzados son:

- **Migración a MongoDB**: Transición de archivos JSON a una base de datos NoSQL para Noticias y Agenda.
- **Arquitectura MVC**: Separación clara de rutas, modelos y controladores.
- **CRUD Completo**: Para SNIF, Provisión de Empleos, Revisión de Red, CITA, SIRH, Boletines, Manuales SGI, RESPEL, RUA, PCB, Convocatorias, Estudios Técnicos, Planes Talento Humano, Plan Monitoreo SIGEP, Manual de Funciones.
- **Panel de Administración Unificado**: Interfaz centralizada para gestionar todos los módulos.
- **🆕 Motor de Búsqueda Universal**: Sistema que indexa automáticamente TODOS los documentos y carpetas de la intranet.
- **Invalidación de Caché en Tiempo Real**: Los archivos nuevos aparecen en el buscador al instante tras ser subidos.

---

## 2. Estructura de Carpetas

```text
/intranet                            ← Raíz del servidor
├── /administracion                  ← Panel de gestión
│   ├── index.html                   ← Dashboard con estadísticas
│   ├── login.html                   ← Acceso administradores
│   └── *.js                         ← Módulos admin (admin-logic.js, sgi-admin.js, etc.)
├── /data                            ← Repositorio central de archivos físicos
│   └── /menu header
│       ├── /sgi
│       │   ├── /Documentos institucionales   ← Membretes, logos, papelería
│       │   ├── /Procesos Estratégicos
│       │   ├── /procesos misionales
│       │   ├── /Evaluación y Seguimiento
│       │   └── /manuales
│       ├── /git
│       │   ├── /boletines
│       │   ├── /gobierno digital
│       │   ├── /manuales de usuario
│       │   └── /normativa GIT
│       ├── /MECI
│       │   └── /Anticorrupcion
│       └── /la cas
├── /header_menu
│   ├── /cas                         ← Noticias, Agenda, Talento Humano, Normativa, etc.
│   ├── /sgi                         ← Todas las secciones del SGI (26 HTML)
│   ├── /git                         ← Normatividad, Gobierno Digital, Manuales Usuario, Boletines
│   └── /git/manuales_usuario        ← CITA, SIRH, SNIF, Revisión de Red
├── /herramientas                    ← RESPEL, RUA, PCB, búsqueda, cartografía, galería, correo
├── /src
│   ├── /controllers                 ← Controladores de negocio
│   ├── /models                      ← Modelos + UniversalCrawler + SgiModel
│   └── /routes                      ← Rutas API REST
├── server.js                        ← Punto de entrada
└── package.json
```

---

## 3. Motor de Búsqueda Universal

### Componentes
| Archivo | Rol |
|:--------|:----|
| `src/models/universalCrawler.js` | Rastreador de archivos físicos + links en HTML |
| `src/models/sgiModel.js` | Extractor de documentos desde los HTML del SGI |
| `src/controllers/searchController.js` | Orquestador de búsqueda con 7 fuentes + índice de páginas |
| `herramientas/busqueda.html` | Interfaz de usuario (filtros: texto, categoría, fechas) |
| `herramientas/search-logic.js` | Frontend: búsqueda en tiempo real, resaltado, animaciones |

### Flujo de Búsqueda
```
Usuario escribe en barra → GET /api/search?q=membrete
    ↓
searchController.js:
  1. Noticias (MongoDB)
  2. Informes de Gestión
  3. Modelos estructurados (15 módulos con archivos)
  4. SGI getAllSections() → todos los HTML del SGI
  5. Agenda
  6. UniversalCrawler.search() → archivos físicos + links HTML
  7. Índice de páginas estáticas (60+ páginas por keywords)
    ↓
Resultados deduplicados → ordenados por fecha → enviados al frontend
    ↓
search-logic.js renderiza cards con resaltado de términos
```

### Actualización del Índice
```
Evento de escritura (POST/PUT/DELETE en /api/)
    ↓
Middleware global en server.js detecta respuesta 2xx
    ↓
UniversalCrawler.invalidate()
    ↓
Próxima búsqueda → índice reconstruido con nuevos archivos
```

> **Sin invalidación explícita**: el índice se reconstruye automáticamente cada **60 segundos**.

---

## 4. Manual de Operación para el Administrador

### Acceso al Panel
Navegar a: `http://localhost:3000/administracion` e ingresar con credenciales de administrador.

### Módulos y sus Fuentes de Datos
| Módulo | Tipo | Dónde guarda |
|:-------|:-----|:-------------|
| NotiCAS | MongoDB | Colección `news` |
| Agenda CAS | MongoDB | Colección `agenda` |
| SGI (todas las secciones) | HTML-as-DB | `header_menu/sgi/*.html` + `/data/menu header/sgi/` |
| RESPEL | HTML-as-DB | `herramientas/respel.html` |
| RUA | HTML-as-DB | `herramientas/rua.html` |
| PCB | HTML-as-DB | `herramientas/pcb.html` |
| Boletines GIT | HTML-as-DB | `header_menu/git/boletines.html` |
| Manuales SGI | HTML-as-DB | `header_menu/sgi/manuales.html` |
| Manual de Funciones | HTML-as-DB | `header_menu/cas/manual-funciones.html` |
| Plan Monitoreo SIGEP | HTML-as-DB | `header_menu/cas/plan-monitoreo-sigep.html` |
| Planes Talento | HTML-as-DB | `header_menu/cas/planes.html` |
| Convocatorias | HTML-as-DB | `header_menu/cas/convocatorias.html` |
| Estudios Técnicos | HTML-as-DB | `header_menu/cas/estudios-tecnicos.html` |
| Provisión de Empleos | HTML-as-DB | `header_menu/cas/provision-empleos.html` |
| CITA | HTML-as-DB | `header_menu/git/manuales_usuario/cita.html` |
| SIRH | HTML-as-DB | `header_menu/git/manuales_usuario/sirh.html` |
| SNIF | HTML-as-DB | `header_menu/git/manuales_usuario/snif.html` |
| Revisión de Red | HTML-as-DB | `header_menu/git/manuales_usuario/revision-red.html` |

### Tip: Agregar Documentos al Buscador Sin el Panel
Si necesitas agregar archivos directamente sin el panel de administración:
1. Copia el archivo `.pdf` o `.docx` a la subcarpeta correspondiente en `/data/menu header/`.
2. En máximo **60 segundos** el `UniversalCrawler` lo detectará y aparecerá en el buscador.

---

## 5. Requisitos y Ejecución

### Dependencias del Sistema
- **Node.js** v18 o superior
- **MongoDB** v7.0 o superior

### Librerías NPM Clave
- `express` — servidor web
- `mongoose` — ODM para MongoDB
- `multer` — manejo de carga de archivos
- `cors` — política de origen cruzado
- `express-session` — manejo de sesiones de administrador

### Comandos de Inicio
```powershell
# Desde la carpeta intranet/intranet
npm install          # Primera vez o tras cambios
npm start            # Inicia en http://localhost:3000
```

---

## 6. Middlewares del Servidor

| Middleware | Función |
|:-----------|:--------|
| `cors()` | Permite peticiones CORS |
| `express.json()` | Parsear cuerpo JSON |
| `express.static()` | Servir HTML, CSS, JS y archivos `/data` |
| `express-session` | Autenticación de administradores |
| `multer` | Carga de archivos (PDFs, Word, imágenes) |
| **🆕 Invalidación de caché** | Cualquier `POST/PUT/DELETE` exitoso → `UniversalCrawler.invalidate()` |

---

## 7. Versiones del Sistema

| Versión | Descripción |
| :--- | :--- |
| **1.0 – 1.3** | Base estática, MVC inicial y estandarización HTML. |
| **2.0.0** | Migración a MongoDB: Noticias y Agenda. |
| **2.1.0** | CRUD completo para manuales CITA. |
| **2.2.0** | CRUD para SNIF, Provisión de Empleos y Revisión de Red. |
| **2.3.0** | Convocatorias, Planes, Estudios Técnicos, Categorías SGI. |
| **2.4.0** | Botón "Ingresar" generalizado con ruta absoluta `/administracion/login.html`. |
| **3.0.0** | **Motor de Búsqueda Universal**: UniversalCrawler, indexación automática, invalidación de caché en tiempo real, búsqueda en tiempo real con resaltado de términos. |

---

> [!TIP]
> **Para nuevos módulos**: Si requiere persistencia en base de datos, siga el patrón de `newsController.js`. Si requiere inserción en HTML, siga el patrón de `sgiController.js`.

> [!NOTE]
> **Para expandir la búsqueda a nuevas carpetas**: Agregue la ruta relativa al array `DATA_DIRS` en `universalCrawler.js`. El sistema la indexará automáticamente.
