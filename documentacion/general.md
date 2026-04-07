# Guía General del Proyecto

Visión global de la estructura y el propósito de la **Intranet CAS**.

## Estructura del Repositorio

- `intranet/`: Servidor Node.js y lógica de negocio.
- `documentacion/`: Repositorio central de manuales y guías técnicas.
- `/data/`: Activos físicos (imágenes, manuales, PDFs).

## Resumen de Hitos Recientes

- **Migración a MongoDB**: Implementación de base de datos NoSQL para Noticias, Agenda y CITA.
- **Implementación de Módulos CRUD**: Creación de administradores para SNIF, Provisión de Empleos y Revisión de Red.
- **Evolución Talento Humano**: Reestructuración de secciones para Convocatorias y Planes con diseño premium.
- **Arquitectura MVC**: Backend organizado en controladores, modelos (Mongoose/FileSystem) y rutas API.
- **Panel de Administración SPA**: Interfaz modernizada para una gestión rápida desde una sola pestaña.
- **Centralización de Datos**: Todos los recursos externos servidos desde el directorio `/data`.
