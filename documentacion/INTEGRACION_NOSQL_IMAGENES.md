# Integración de Bases de Datos NoSQL con Imágenes
## 📂 Implementación en la Intranet CAS

El proyecto ha evolucionado de archivos locales JSON a **MongoDB**, permitiendo una gestión de contenidos más robusta y escalable.

---

## 1. Estrategia de Almacenamiento Utilizada

En la Intranet CAS se utiliza la estrategia **Por Referencia**:
- Las imágenes y PDFs se guardan en el sistema de archivos del servidor (carpeta `/data`).
- En MongoDB solo se almacena el **Path (ruta relativa)** del archivo.

**Pros:**
- Máximo rendimiento: La base de datos se mantiene ligera.
- Facilidad de acceso: Las imágenes se sirven directamente mediante `express.static`.

---

## 2. Implementación con MongoDB

### Configuración
Se utiliza **Mongoose** como ODM para conectar el servidor Node.js con la instancia local de MongoDB.
- **URI por defecto**: `mongodb://127.0.0.1:27017/intranet_cas`

### Módulos Migrados
1.  **Noticias (NotiCAS)**: Colección `news`.
2.  **Agenda Institucional**: Colección `agenda`.
3.  **Manuales CITA**: Colección `citas`.

---

## 3. Esquema de Datos (Mongoose)

El esquema implementado para una noticia se ve así:

```javascript
const noticiaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  imagen: String, // Ejemplo: "data/imagenes/noticias/1740776595503.jpg"
  fecha: { type: Date, default: Date.now }
});
```

Para el módulo **CITA**, el esquema incluye categorías para organizar los archivos físicamente en disco:

```javascript
const citaSchema = new mongoose.Schema({
  titulo: String,
  categoria: String, // 'mecanica', 'eletrica', etc.
  archivoPath: String,
  fecha: { type: Date, default: Date.now }
});
```

---

## 4. Conclusión Técnica

La implementación de MongoDB ha permitido:
1. **Velocidad**: Consultas y filtrados instantáneos sin leer archivos pesados de disco.
2. **Escalabilidad**: Capacidad para manejar miles de registros sin degradación de performance.
3. **Integridad**: Validaciones a nivel de esquema para asegurar que los datos sean consistentes.

---

> [!TIP]
> **Limpieza de Archivos**: Al eliminar un registro en MongoDB, el controlador también se encarga de eliminar el archivo físico en `/data` para evitar la acumulación de archivos huérfanos.
