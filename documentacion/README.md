# Portal de Intranet — CAS
## Corporación Autónoma Regional de Santander

El sistema es una plataforma corporativa dinámica que incluye gestión de contenidos basada en MongoDB, un motor de búsqueda universal, visualización de documentos oficiales y un panel de administración centralizado.

---

## 📖 Documentación Completa

| # | Documento | Descripción |
|---|-----------|-------------|
| 1 | **[Documento Maestro](./documentacion/DOCUMENTO_MAESTRO_INTRANET.md)** | Visión integral: arquitectura, fases, motor de búsqueda y roadmap. |
| 2 | **[Manual Técnico y de Operación](./documentacion/MANUAL_TECNICO_Y_DE_OPERACION.md)** | Guía definitiva para administración, módulos y operación del sistema. |
| 3 | **[Motor de Búsqueda Universal](./documentacion/MOTOR_BUSQUEDA_UNIVERSAL.md)** | 🆕 Documentación técnica del UniversalCrawler e índice de búsqueda. |
| 4 | **[Documentación Técnica](./documentacion/tecnico.md)** | Instalación, versiones y herramientas de mantenimiento. |
| 5 | **[Arquitectura MVC](./documentacion/arquitectura_mvc.md)** | Detalle del patrón de diseño en el backend. |
| 6 | **[Gestión de Datos](./documentacion/gestion_datos.md)** | Organización de archivos y activos en `/data`. |
| 7 | **[Administración](./documentacion/administracion.md)** | Guía del panel de gestión para administradores. |
| 8 | **[Guía de Navegación](./documentacion/guia_navegacion.md)** | Estructura del portal, menús y dashboard. |
| 9 | **[Herramientas](./documentacion/herramientas.md)** | Catálogo de utilidades y páginas especiales. |
| 10 | **[Importación y Despliegue](./documentacion/GUIA_IMPORTACION_Y_DESPLIEGUE.md)** | Guía paso a paso para clonar e instalar el sistema. |

---

## 🚀 Inicio Rápido

### Requisitos
- **Node.js** v18+
- **MongoDB** v7.0+ (corriendo localmente)

### Iniciar el Servidor
```powershell
cd intranet
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`.

### Acceso de Usuarios Finales
Los usuarios de la oficina **NO NECESITAN INSTALAR NADA**. Solo abrir el navegador:
```
http://[IP_DEL_SERVIDOR]:3000
```

---

## 📂 Estructura Principal

```text
/
├── intranet/                    ← Aplicación del servidor
│   ├── src/
│   │   ├── controllers/         ← Lógica de negocio
│   │   ├── models/              ← Modelos de datos + UniversalCrawler
│   │   │   └── universalCrawler.js   ← 🆕 Motor de indexación universal
│   │   └── routes/              ← API REST
│   ├── header_menu/             ← Páginas HTML por sección (CAS, SGI, GIT)
│   ├── herramientas/            ← RESPEL, RUA, PCB, Búsqueda Avanzada
│   ├── administracion/          ← Panel de control
│   ├── data/                    ← Archivos físicos (PDFs, Word, imágenes)
│   └── server.js                ← Servidor Express
└── documentacion/               ← Manuales y guías técnicas
```

---

## 🔍 Motor de Búsqueda

La intranet cuenta con un **motor de búsqueda universal** accesible desde:
- **Barra de búsqueda del header** → en cualquier página de la intranet
- **Búsqueda Avanzada** → `http://localhost:3000/herramientas/busqueda.html`

**Características:**
- Indexa automáticamente **todos los documentos** de todas las carpetas
- Búsqueda en tiempo real mientras se escribe
- Resaltado de términos en los resultados
- Filtros por categoría y rango de fechas
- Los archivos recién subidos aparecen en la búsqueda al instante

---

## 🛠️ Para Desarrolladores

1. Asegúrese de tener MongoDB activo en `mongodb://127.0.0.1:27017/intranet_cas`.
2. Ejecute `npm install` tras descargar cambios.
3. Pruebe con `npm start` dentro de `/intranet`.
4. Para expandir la búsqueda a nuevas carpetas, edite `DATA_DIRS` en `src/models/universalCrawler.js`.
5. Actualice la documentación en `/documentacion/` tras cada cambio importante.