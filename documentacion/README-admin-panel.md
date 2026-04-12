# Panel de Administración — Guía de Operación

## Referencia para Administradores de la Intranet CAS

---

## 1. Acceso

```
http://localhost/CAS/intranet_CAS/intranet/administracion/login.html
```

**Credenciales del superadministrador:**
- **Usuario:** `Admin`
- **Contraseña:** `1234` *(cambiar en el primer uso)*

> [!CAUTION]
> Cambiar la contraseña por defecto inmediatamente después del primer acceso desde la sección **Gestión de Usuarios**.

---

## 2. Roles del Sistema

| Rol | Descripción |
|:----|:------------|
| `superadmin` | Acceso total a todos los módulos, incluyendo Gestión de Usuarios |
| `admin` | Acceso solo a los módulos habilitados en sus permisos individuales |

---

## 3. Módulos del Panel

### 3.1 NotiCAS — Noticias Institucionales
- **Crear**: Título, descripción, imagen (subida como multipart)
- **API**: `POST /api/news` + `POST /api/news/upload`
- **Eliminar**: `DELETE /api/news/{id}`

### 3.2 Eventos y Agenda
- **Crear evento**: Nombre, fecha, lugar, descripción → `POST /api/eventos`
- **Crear ítem agenda**: Título, fecha, hora → `POST /api/agenda`
- **Eliminar**: `DELETE /api/eventos/{id}` o `DELETE /api/agenda/{id}`

### 3.3 Banner Pasarela
- **Crear banner**: Sube imagen → `POST /api/banner/upload`, luego registra → `POST /api/banner`
- **Eliminar**: `DELETE /api/banner/{id}`
- El banner se muestra en la pasarela de la página principal

### 3.4 SGI — Sistema de Gestión Integrado (22 secciones)

Secciones disponibles:
`planeacion`, `mejora`, `admin-recursos`, `planeacion-ambiental`, `vigilancia-control`, `control-interno`, `documentos`, `talento-humano`, `gestion-documental`, `gestion-financiera`, `gestion-tecnologias`, `juridico`, `contratacion`, `gestion-integral`, `procesos-estrategicos`, `procesos-misionales`, `procesos-apoyo`, `control-disciplinario`, `cobro-coactivo`, `bienes-servicios`, `objetivos-calidad`, `politicas`, `manuales`

**Flujo para agregar documento:**
1. Subir archivo: `POST /api/sgi/upload` (multipart con campos `file`, `section`, `category`)
2. Registrar en HTML: `POST /api/sgi/{seccion}` con `{ name, fileUrl, category }`
3. El documento aparece inmediatamente en la sección correspondiente

### 3.5 Informe de Gestión
- Sube PDF directamente: `POST /api/informe-gestion/upload`
- Registra metadata: `POST /api/informe-gestion` con `{ pdfUrl, title, description }`
- Los PDFs se listan automáticamente en `header_menu/cas/informe-gestion.html`

### 3.6 RESPEL
Cuatro sub-secciones: `documentos`, `obligaciones`, `gestores`, `empresas`
- Sube documento: `POST /api/respel/upload`
- Crea entrada: `POST /api/respel/{seccion}`
- Actualiza: `PUT /api/respel/{seccion}/{id}`
- Elimina: `DELETE /api/respel/{seccion}/{id}`

### 3.7 RUA y PCB
- RUA: CRUD sobre `data/Herramientas/Rua/rua.json`
- PCB: Documentos en `herramientas/pcb.html` + tabla JSON en `data/Herramientas/pcb-tabla.json`

### 3.8 Módulos de Talento Humano
| Módulo | Ruta API |
|:-------|:---------|
| Manual de Funciones | `/api/manual-funciones` |
| Plan Monitoreo SIGEP | `/api/plan-monitoreo` |
| Planes Talento Humano | `/api/planes-talento` |
| Convocatorias | `/api/convocatorias` |
| Estudios Técnicos | `/api/estudios-tecnicos` |
| Provisión de Empleos | `/api/provision-empleos` |

Todos siguen el mismo patrón: subir archivo → registrar metadata.

### 3.9 Módulos GIT (Manuales de Usuario)
| Módulo | Ruta API |
|:-------|:---------|
| CITA | `/api/cita` |
| SIRH | `/api/sirh` |
| SNIF | `/api/snif` |
| Revisión de Red | `/api/revision-red` |
| Boletines GIT | `/api/boletines` |
| Políticas SGI | `/api/politicas-sgi` |
| Manuales SGI | `/api/manuales-sgi` |

### 3.10 Directorio Institucional
- Crear contacto: `POST /api/directorio` con `{ nombre, cargo, correo, telefono }`
- Editar: `PUT /api/directorio/{id}`
- Eliminar: `DELETE /api/directorio/{id}`

### 3.11 Gestión de Usuarios *(Solo superadmin)*
- Listar: `GET /api/users`
- Crear: `POST /api/users` — la contraseña se hashea automáticamente con bcrypt
- Actualizar: `PUT /api/users/{id}` — si se envía `password`, se re-hashea
- Eliminar: `DELETE /api/users/{id}`

**28 permisos configurables:**
`banner`, `eventos`, `correos`, `informe_gestion`, `news`, `agenda_cas`, `sgi_planeacion`, `sgi_mejora`, `sgi_recursos`, `sgi_ambiental`, `sgi_vigilancia`, `sgi_control`, `sgi_manuales`, `sgi_politicas`, `respel`, `rua`, `boletines_git`, `pcb`, `cita`, `sirh`, `revision_red`, `snif`, `users`, `manual_funciones`, `sigep`, `planes_talento`, `convocatorias`, `estudios_tecnicos`, `provision_empleos`

---

## 4. Archivos del Panel

| Archivo | Función |
|:--------|:--------|
| `administracion/index.html` | Estructura HTML del panel completo |
| `administracion/login.html` | Formulario de autenticación |
| `administracion/admin-logic.js` | Motor JS: carga dinámica de módulos, permisos, navegación |
| `administracion/admin-styles.css` | Hoja de estilos del panel |
| `administracion/banner-admin.js` | Lógica del módulo Banner |
| `administracion/cita-admin.js` | Lógica del módulo CITA |
| `administracion/informe-gestion-admin.js` | Lógica del módulo Informe de Gestión |
| `administracion/users-admin.js` | Lógica de Gestión de Usuarios |
| `administracion/[modulo]-admin.js` | Un archivo por cada módulo adicional |

---

## 5. Verificación del Estado del Servidor

Abrir en el navegador:
```
http://localhost/CAS/intranet_CAS/intranet/api/test-server
```

Respuesta exitosa:
```json
{ "status": "ok", "engine": "PHP", "time": "2026-04-12T..." }
```
