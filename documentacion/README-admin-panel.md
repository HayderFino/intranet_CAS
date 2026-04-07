# 📋 README — Panel de Administración Intranet CAS

> **Servidor:** `http://localhost:3000`  
> **Panel Admin:** `http://localhost:3000/administracion`  
> **Iniciado con:** `node server.js` desde `intranet/`

---

## ¿Cómo funciona el sistema de administración?

El panel es una **página única (SPA)** donde todos los módulos están cargados en `administracion/index.html` y se muestran u ocultan mediante JavaScript (`admin-logic.js`). 

Existen dos tipos de persistencia:
1. **MongoDB (Mongoose)**: Para Noticias, Agenda y CITA.
2. **Sistema de Archivos Dinámico (CRUD)**: Para SNIF, Provisión de Empleos y Revisión de Red (metadatos en JSON/API + Archivos).
3. **HTML-as-DB**: Para SGI, RESPEL, RUA, PCB y Boletines.

```
Formulario Admin
    ↓ fetch()
Express (server.js)
    ↓ Route → Controller
    ↙               ↘
MongoDB (NoSQL)    Archivo HTML (Inyección)
```

---

## 🗂️ Módulos del Panel

---

### 1. 📰 Noticias (NotiCAS)

**Descripción:** Gestión de noticias institucionales.  
**Almacenamiento:** MongoDB → colección `news`  
**API:** `/api/news`  
**Archivo público:** `header_menu/cas/noticas-cas.html` (consumido vía API).

| Acción | Método | Endpoint |
|--------|--------|----------|
| Listar | GET | `/api/news` |
| Crear | POST | `/api/news` (multipart con imagen) |
| Actualizar | PUT | `/api/news/:id` |
| Eliminar | DELETE | `/api/news/:id` |

---

### 2. 📅 Agenda CAS

**Descripción:** Eventos institucionales.  
**Almacenamiento:** MongoDB → colección `agenda`  
**API:** `/api/agenda`

---

### 3. 🛠️ Manuales CITA (NUEVO)

**Descripción:** Gestión de manuales técnicos CITA organizados por categorías.  
**Almacenamiento:** MongoDB → colección `citas`  
**Archivos:** `/intranet/data/uploads/citas/:categoria/`

| Acción | Método | Endpoint |
|--------|--------|----------|
| Listar | GET | `/api/cita` |
| Crear | POST | `/api/cita` (multipart con PDF) |
| Eliminar | DELETE | `/api/cita/:id` |

**Categorías soportadas:** Mecánica, Eléctrica, Electrónica, Estructural, Otros.  
*Nota: El sistema crea automáticamente la carpeta de la categoría si no existe al subir el primer archivo.*

---

### 4. 🌿 SGI — Procesos Estratégicos y Misionales

**Descripción:** Documentos del Sistema de Gestión Integrado.  
**Almacenamiento:** HTML-as-DB (modifica el HTML público).  
**API:** `/api/sgi/:section`

**Secciones:** `planeacion`, `mejora`, `admin-recursos`, `planeacion-ambiental`, `vigilancia-control`.

---

### 5. ☢️ RESPEL / 💧 RUA / ⚡ PCB

**Descripción:** Herramientas técnicas de medio ambiente.  
**Almacenamiento:** HTML-as-DB.  
**API:** `/api/respel`, `/api/rua`, `/api/pcb`.

---

### 6. 🔒 Boletines GIT

**Descripción:** Boletines de seguridad informática.  
**Almacenamiento:** HTML-as-DB.  
**API:** `/api/boletines`.

---

### 7. 📁 Módulos de Documentación (SNIF, Provisión, Revisión Red)

**Descripción:** Gestión completa de archivos para módulos específicos de GIT y Talento Humano.  
**Archivos:** `/intranet/data/uploads/[snif|provision_empleos|revision_red]/`  
**Lógica:** JavaScript especializado (`snif-admin.js`, etc.) con persistencia en metadatos.

| Módulo | Sección | Ruta de Carga |
|--------|---------|---------------|
| SNIF | Documentación | `data/uploads/snif/` |
| Provisión | Carrera | `data/uploads/provision_empleos/` |
| Revisión Red | Sedes | `data/uploads/revision_red/` |

---

## 📌 Marcadores HTML (Solo para Módulos HTML-as-DB)

| Módulo | Marcador |
|--------|----------|
| RUA | `<!-- END_RUA_GRID -->` |
| RESPEL | `<!-- END_RESPEL_GRID -->` |
| Boletines | `<!-- END_BOLETINES_GRID -->` |
| PCB | `<!-- END_PCB_GRID -->` |

---

## ⚠️ Consideraciones importantes

### MongoDB
- Asegúrese de que el servicio `mongod` esté activo antes de iniciar el servidor Node.js.
- Los modelos se encuentran en `src/models/MongoNews.js`, `src/models/Agenda.js` y `src/models/Cita.js`.

### Upload de archivos
Multer requiere que los campos de texto (`section`, `category`) lleguen **antes** que el archivo (`file`) en el `FormData`.

---

*Actualizado el 2 de marzo de 2026*
