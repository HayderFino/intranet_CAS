# Documentación Técnica — Intranet CAS

Detalle técnico sobre el entorno, ejecución y mantenimiento de la **Intranet CAS**.

## 🚀 Instalación y Ejecución

### Requisitos
- **Node.js**: v18 o superior.
- **MongoDB**: v7.0 o superior (instancia local o remota).
- **NPM**: Manejador de paquetes (incluido con Node.js).

### Pasos de Lanzamiento
1. Abrir terminal en la carpeta `intranet/intranet` del proyecto.
2. Ejecutar `npm install` para instalar dependencias.
3. Iniciar el servicio de MongoDB en el servidor.
4. Ejecutar `npm start`.

## 📄 Control de Versiones

| Versión | Descripción |
| :--- | :--- |
| **1.0 - 1.3** | Desarrollo inicial, MVC y estandarización HTML. |
| **2.0.0** | **Migración a MongoDB**: Persistencia NoSQL para noticias y agenda. |
| **2.1.0** | **Módulo CITA**: CRUD completo para manuales técnicos con carga dinámica. |
| **2.2.0** | **Módulos de Archivos**: CRUD para SNIF, Provisión de Empleos y Revisión de Red. |
| **2.3.0** | **Talento Humano**: Convocatorias, Planes, Estudios Técnicos, Provisión de Empleos. |
| **2.4.0** | **Login Generalizado**: Botón "Ingresar" con ruta absoluta en todas las páginas. |
| **3.0.0** | **Motor de Búsqueda Universal**: `UniversalCrawler`, invalidación de caché en tiempo real, búsqueda en tiempo real con resaltado de términos en el frontend. |

## 🛠️ Herramientas de Mantenimiento
- **Visual Studio Code**: Recomendado para edición de código.
- **MongoDB Compass**: Para visualización y limpieza de datos en la BD `intranet_cas`.
- **PowerShell**: Para ejecutar el script de actualización de layouts `generate_pages.ps1`.
- **Postman / curl**: Para probar endpoints API como `GET /api/search?q=membrete`.

## 🔍 Verificar el Motor de Búsqueda

Para probar que el buscador está indexando correctamente, ejecutar en PowerShell:

```powershell
# Ver total de documentos indexados
node -e "const u=require('./src/models/universalCrawler'); console.log('Indexados:', u.getIndex().length)"

# Buscar un término específico
Invoke-WebRequest -Uri "http://localhost:3000/api/search?q=membrete" -UseBasicParsing | ConvertFrom-Json | ForEach-Object { $_.title }
```
