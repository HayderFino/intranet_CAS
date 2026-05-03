# Manual Técnico y de Operación — Intranet CAS

## Arquitectura PHP/XAMPP — Referencia para Desarrolladores

---

## 1. Stack Tecnológico

| Componente | Tecnología | Notas |
|:-----------|:----------|:------|
| Servidor web | Apache (XAMPP) | mod_rewrite habilitado |
| Backend | PHP 8.x | Sin frameworks externos |
| Frontend | HTML5, CSS3 Vanilla, JS ES6+ | Sin React, Vue ni Angular |
| Persistencia | JSON planos + Sistema de archivos | Sin base de datos |
| Autenticación | Sesiones PHP + bcrypt | Sin JWT ni OAuth |
| Enrutamiento | `.htaccess` mod_rewrite | Todo pasa por `api.php` |

---

## 2. Arquitectura Modular y Enrutamiento

El sistema utiliza una arquitectura modular distribuida en la carpeta `api/`. El archivo `api.php` actúa únicamente como punto de entrada (Bootstrapper).

| Componente | Carpeta / Archivo | Descripción |
|:-----------|:------------------|:------------|
| **Entry Point** | `api.php` | Carga la configuración, el núcleo y los módulos. |
| **Core** | `api/core/` | Contiene el Router, Helpers y lógica de Autenticación. |
| **Módulos** | `api/modules/` | Lógica de negocio segmentada (SGI, MECI, Search, etc.). |

### Módulos Especializados

| Módulo | Archivo | Funcionalidad |
|:-------|:--------|:--------------|
| `auth` | `auth.php` | Login, logout, check de sesión |
| `jsonCrud` | `jsonCrud.php` | CRUD genérico (News, eventos, agenda, banner, etc.) |
| `uploads` | `uploads.php` | Rutas de subida de archivos |
| `sgi` | `sgi.php` | Lógica de SGI y bases de datos HTML |
| `herramientas`| `herramientas.php` | Módulos especializados RUA y PCB |
| `search` | `search.php` | Motor de búsqueda universal |
| `misc` | `misc.php` | Informe de Gestión y Health check |

### Helpers Globales Disponibles

```php
out($data, $code)         // Responder JSON y terminar
body()                    // Leer JSON del cuerpo de la petición
auth($superadmin)         // Verificar sesión (y rol si $superadmin=true)
read_json($path)          // Leer archivo JSON como array
write_json($path, $data)  // Escribir array como archivo JSON
upload_file($field, $dir) // Subir $_FILES[$field] a $dir, retornar URL relativa
dent($s)                  // Decodificar entidades HTML → caracteres reales
eent($s)                  // Codificar caracteres → entidades HTML
html_remove_block()       // Eliminar un bloque HTML con data-id
html_get_items()          // Extraer items HTML con data-id
```

---

## 3. Sistema de Enrutamiento

El archivo `.htaccess` redirige todas las peticiones a `/api/*`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.+)$ api.php?route=$1 [QSA,L]
RewriteRule ^api/?$ api.php?route= [QSA,L]
```

El sistema implementa un **Mini-Router** en `api/core/router.php` que despacha peticiones basadas en el método HTTP y la ruta:

```php
route('GET', 'noticias', function() { ... });
route('POST', 'noticias', function() { ... });
route('DELETE', 'noticias/:id', function($id) { ... });
```

Soporta parámetros dinámicos (usando `:nombre`) que son pasados automáticamente como argumentos a la función de callback.

---

## 4. Patrones de Persistencia

### 4.1. JSON Plano (news, eventos, agenda, banner, directorio, users)

```php
$JSON_MAP = [
    'news'    => 'data/noticias.json',
    'eventos' => 'data/eventos.json',
    // ...
];
```

Cada colección es un array JSON. El CRUD es completo (GET/POST/PUT/DELETE). Los IDs se generan con `uniqid()`.

### 4.2. HTML-as-DB (SGI, PCB)

Los documentos SGI se insertan como nodos `<a class="file-item" data-id="...">` dentro de archivos HTML estáticos. La API:
- **GET**: parsea el HTML con regex y devuelve JSON
- **POST**: inserta un nuevo nodo HTML dentro del `<div class="file-list-grid">`
- **DELETE**: elimina el nodo con el `data-id` correspondiente y borra el archivo físico

### 4.3. Directorio Físico + metadata.json (módulos genéricos)

Para módulos como `manual-funciones`, `boletines`, `cita`, etc.:
- Los archivos se guardan físicamente en la carpeta correspondiente
- Un archivo `metadata.json` en la misma carpeta guarda el nombre amigable del archivo
- El GET escanea la carpeta con `scandir()` y combina con metadata

---

## 5. Sistema de Autenticación

### Flujo de Login
```
POST /api/auth/login  { username, password }
    ↓
Lee default_user.json
    ↓
password_verify($input, $hash_bcrypt)
    ↓
Si OK → $_SESSION['userId'], ['role'], ['permissions']
    ↓
Responde { success: true, user: { ... } }
```

### Roles y Permisos
- **`superadmin`**: acceso total a todos los módulos
- **`admin`**: acceso solo a los módulos habilitados en su objeto `permissions`

El objeto `permissions` tiene 28 claves booleanas (una por módulo). El panel frontend lee estos permisos al cargar y oculta/muestra secciones dinámicamente.

### Agregar un Nuevo Usuario
Desde el panel de administración → sección **Gestión de Usuarios**, o editando directamente `default_user.json`:

```json
{
    "username": "nuevo_usuario",
    "password": "$2y$10$...",  // Hash generado por PHP password_hash()
    "displayName": "Nombre Completo",
    "role": "admin",
    "permissions": {
        "news": true,
        "banner": false,
        // ...
    }
}
```

> [!CAUTION]
> Nunca guardes contraseñas en texto plano en `default_user.json`. Siempre usa `password_hash($pass, PASSWORD_BCRYPT)` para generar el hash.

---

## 6. Motor de Búsqueda — Detalles Técnicos

La ruta `GET /api/search?q=texto&category=all&startDate=&endDate=` ejecuta:

1. **Carga noticias.json** y filtra por texto y fecha
2. **Escanea HTML** de `header_menu/` con `glob()` y `preg_match_all()`, extrayendo elementos `.file-item` y `.pdf-folder-card`
3. **Escanea directorios físicos** en `data/` con función recursiva que busca archivos con extensiones `pdf`, `docx`, `doc`, `xlsx`, `xls`, `pptx`, `ppt`
4. Devuelve máximo **50 resultados** combinados

Diferencias con el antiguo buscador Node.js:
| Aspecto | Antes (Node.js) | Ahora (PHP) |
|:--------|:----------------|:------------|
| Caché de índice | 60 seg en memoria | Sin caché (scan en tiempo real) |
| Fuentes | 7 fuentes paralelas | 3 fuentes secuenciales |
| Noticias | MongoDB | `noticias.json` |
| Performance | Alta (caché) | Aceptable (archivos locales) |

---

## 7. Gestión de Archivos Subidos

```php
function upload_file($field, $destDir) {
    $dir  = __DIR__ . '/' . ltrim($destDir, '/');
    mkdir($dir, 0777, true);                           // Crear carpeta si no existe
    $name = time() . '-' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $f['name']); // Sanitizar nombre
    move_uploaded_file($f['tmp_name'], $dir . '/' . $name);
    return '/' . ltrim($destDir, '/') . '/' . $name;  // URL relativa
}
```

Los archivos se nombran con timestamp para evitar colisiones. La URL retornada es relativa al raíz de htdocs.

---

## 8. Agregar un Nuevo Módulo al Sistema

### Paso 1: Crear la carpeta de datos
```
intranet/data/menu header/nueva-seccion/
```

### Paso 2: Registrar el módulo en la API

Si es un CRUD simple, añádalo al mapa `$JSON_MAP` en `api/modules/jsonCrud.php`. 
Si requiere lógica compleja, cree un nuevo archivo en `api/modules/` y regístrelo en `api.php`.

Ejemplo de nueva ruta modular:
```php
route('GET', 'mi-modulo', function() {
    out(read_json(DATA_ROOT . 'data/mi-data.json'));
});
```

### Paso 3: Crear la página HTML de vista
Copiar la estructura de una página existente en `header_menu/cas/` y adaptarla.

### Paso 4: Agregar módulo al panel de admin
Agregar un bloque en `administracion/index.html` y un archivo `nueva-seccion-admin.js` con la lógica CRUD.

### Paso 5: Agregar permiso al `default_user.json`
```json
"permissions": {
    "nueva_seccion": true/false
}
```

---

## 9. Consideraciones de Seguridad

| Aspecto | Estado | Recomendación |
|:--------|:-------|:-------------|
| Contraseñas | ✅ bcrypt | Mantener PASSWORD_BCRYPT |
| Sesiones | ✅ PHP sessions | Configurar `session.cookie_secure` en producción |
| CORS | ⚠️ Abierto (`*`) | Restringir a dominios de la organización en producción |
| Listado de directorios | ✅ `Options -Indexes` en .htaccess | OK |
| Inyección de archivos | ⚠️ Básico | Validar extensiones en upload |
| Acceso a `/data/` | ⚠️ Público | Considerar bloqueo con .htaccess si los archivos son confidenciales |

---

## 10. Solución de Problemas Comunes

### El panel de admin no carga / redirige a login
- Verificar que las sesiones PHP estén habilitadas en XAMPP
- Comprobar que Apache esté corriendo
- Limpiar cookies del navegador

### Error 404 en `/api/...`
- Verificar que `mod_rewrite` esté activo en Apache
- Verificar que `AllowOverride All` esté configurado en `httpd.conf`
- Confirmar que el archivo `.htaccess` existe en `/intranet/`

### Los archivos subidos no aparecen
- Verificar permisos de escritura en la carpeta `/data/`
- En Windows/XAMPP: la carpeta `htdocs` normalmente tiene permisos completos
- Comprobar `upload_max_filesize` y `post_max_size` en `php.ini`

### La búsqueda no encuentra archivos nuevos
- El buscador escanea en tiempo real: el archivo debe estar en `/data/menu header/`
- Verificar que la extensión del archivo sea soportada: `pdf`, `docx`, `doc`, `xlsx`, `xls`, `pptx`, `ppt`

### Error al conectar a la API (CORS)
- Las cabeceras CORS ya están incluidas en `api.php`
- Si hay problemas, verificar que la petición incluya `credentials: 'include'` en el fetch

---

## 11. Configuración PHP Recomendada (php.ini)

```ini
upload_max_filesize = 50M
post_max_size       = 55M
memory_limit        = 256M
max_execution_time  = 60
session.gc_maxlifetime = 3600
```

Ubicación del archivo en XAMPP Windows:
```
C:\xampp\php\php.ini
```
