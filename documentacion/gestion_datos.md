# Gestión de Datos y Activos

El sistema utiliza una arquitectura híbrida para la persistencia: **MongoDB** para datos estructurados y el **Sistema de Archivos** para activos binarios.

## 1. Datos Estructurados (MongoDB)
Las colecciones en la base de datos `intranet_cas` almacenan la información de:
- **news**: Títulos, fechas, descripciones y referencias a imágenes.
- **agenda**: Eventos institucionales.
- **citas**: Metadatos de manuales técnicos.

## 2. Directorio de Activos `/intranet/data`
Contiene los archivos físicos que sirve el servidor:
- `/imagenes/noticias/`: Fotos subidas desde el panel Admin.
- `/uploads/`: Carpetas dinámicas para manuales y archivos:
  - `citas/`: Manuales PDFs organizados por subcarpetas de categoría.
  - `snif/`, `provision_empleos/`, `revision_red/`: Documentos gestionados desde el panel.
- `/boletines/`, `/manuales-sgi/`, `/meci/`: Documentos de referencia para áreas específicas.
- `/menu header/la cas/talento humano/`: Contiene subcarpetas para SIGEP, Planes, Convocatorias, Estudios Técnicos, Provisión de Empleos, etc.

## 3. Respaldo
- **Base de Datos**: Se recomienda usar `mongodump` semanalmente.
- **Archivos**: Copia de seguridad del directorio `/data` mensualmente o tras cargas masivas de manuales.
