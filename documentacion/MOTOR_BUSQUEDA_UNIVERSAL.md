# Motor de Búsqueda Universal — Intranet CAS
## Documentación Técnica Detallada

---

## 1. Descripción General

El `UniversalCrawler` es un indexador automático que rastreea **toda la intranet** para construir un índice de búsqueda unificado. Combina dos estrategias:

- **Crawl de archivos físicos**: Lee directamente las carpetas `/data/menu header/` y extrae todos los archivos `.pdf`, `.docx`, `.doc`, `.xlsx`, `.pptx`, `.odt` que encuentre.
- **Crawl de HTML**: Lee todos los archivos HTML en `/header_menu/` y extrae los links `<a class="file-item">`.

---

## 2. Archivos del Sistema de Búsqueda

| Archivo | Descripción |
|:--------|:------------|
| `src/models/universalCrawler.js` | Motor principal de indexación |
| `src/models/sgiModel.js` | Modelo SGI con `getAllSections()` para SearchController |
| `src/controllers/searchController.js` | Orquestador: consulta 7 fuentes y combina resultados |
| `herramientas/busqueda.html` | Interfaz HTML del buscador |
| `herramientas/search-logic.js` | Lógica frontend: debounce, resaltado, renderizado |

---

## 3. Configuración del Crawler

### Carpetas de Archivos Físicos Indexadas
```javascript
const DATA_DIRS = [
    'data/menu header/sgi/Documentos institucionales',  // Membretes, logos, papelería
    'data/menu header/sgi/Procesos Estratégicos',
    'data/menu header/sgi/manuales',
    'data/menu header/git',       // Boletines, gobierno digital, manuales usuario
    'data/menu header/MECI',      // Documentos anticorrupción
    'data/menu header/la cas',
    'data/Talento humano',
    'data/Herramientas',
];
```

### Carpetas HTML Rastreadas
```javascript
const HTML_DIRS = [
    'header_menu/cas',
    'header_menu/sgi',
    'header_menu/git',
    'header_menu/git/manuales_usuario',
    'header_menu/talento-humano',
    'herramientas',
];
```

### Extensiones de Archivo Reconocidas
`.pdf`, `.docx`, `.doc`, `.xlsx`, `.xls`, `.pptx`, `.ppt`, `.odt`, `.ods`, `.odp`

---

## 4. Ciclo de la Caché

```
Primera búsqueda del día
    ↓
_cache === null → reconstruir índice
    ↓
crawlPhysicalFiles() + crawlHtmlFiles()
    ↓
Deduplicar por href → guardar en _cache con timestamp
    ↓
Responder con _cache (82+ documentos)

─── Pasados 60 segundos ──────────────────
    ↓
Date.now() - _cacheTime > 60000
    ↓
Reconstruir índice automáticamente

─── Evento POST/PUT/DELETE exitoso ───────
    ↓
Middleware en server.js → UniversalCrawler.invalidate()
    ↓
_cache = null → próxima búsqueda reconstruye índice
```

---

## 5. Agregar Nuevas Carpetas al Índice

Para incluir una nueva carpeta en la búsqueda, editar `universalCrawler.js`:

```javascript
// Agregar al array DATA_DIRS:
const DATA_DIRS = [
    // ... carpetas existentes ...
    'data/nueva-seccion/documentos',   // ← nueva carpeta
];

// O para una nueva carpeta con HTML:
const HTML_DIRS = [
    // ... carpetas existentes ...
    'header_menu/nueva-seccion',       // ← nuevo HTML
];
```

No se requiere reiniciar el servidor. La próxima búsqueda usará la nueva configuración.

---

## 6. API del Buscador

### Endpoint
```
GET /api/search?q={término}&category={categoría}&startDate={fecha}&endDate={fecha}
```

### Parámetros
| Parámetro | Valores | Descripción |
|:----------|:--------|:------------|
| `q` | texto libre | Búsqueda AND por palabras |
| `category` | `all`, `noticias`, `informes`, `manuales` | Filtro de categoría |
| `startDate` | `YYYY-MM-DD` | Fecha mínima del documento |
| `endDate` | `YYYY-MM-DD` | Fecha máxima del documento |

### Ejemplo de Respuesta
```json
[
  {
    "title": "Membrete Carta CAS - Grises",
    "type": "Documento Institucional",
    "href": "/data/menu header/sgi/Documentos institucionales/membrete-carta-cas-grises.docx",
    "date": "2024-01-01",
    "snippet": "Archivo: membrete-carta-cas-grises.docx — Documento Institucional"
  }
]
```

---

## 7. Diagnóstico

### Verificar el Total Indexado
```powershell
node -e "const u=require('./src/models/universalCrawler'); const i=u.getIndex(); console.log('Total:', i.length); i.slice(0,5).forEach(x=>console.log('-', x.title))"
```

### Probar una Búsqueda
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/search?q=membrete" -UseBasicParsing | ConvertFrom-Json | ForEach-Object { "$($_.title) | $($_.type)" }
```

### Forzar Invalidación Manual
```javascript
// En Node.js REPL o desde cualquier módulo:
const UniversalCrawler = require('./src/models/universalCrawler');
UniversalCrawler.invalidate();
```

---

> [!NOTE]
> El índice inicial se construye en la **primera búsqueda** después de reiniciar el servidor, no al arrancar. Esto evita que el servidor tarde en responder al inicio.

> [!TIP]
> Si los archivos no aparecen en el buscador, verifique que la extensión del archivo esté incluida en el array `DOC_EXTENSIONS` del `universalCrawler.js`.
