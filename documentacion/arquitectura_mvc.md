# Arquitectura MVC (Model-View-Controller)

El backend del portal utiliza el patrón MVC para desacoplar la lógica de datos de la presentación, facilitando el mantenimiento y la escalabilidad.

## Directorio `intranet/src`

- **controllers/**: Contiene la lógica para procesar peticiones, validaciones y orquestar los modelos.
  - `newsController.js`: Gestión de noticias.
  - `citaController.js`: Gestión de manuales técnicos.
- **models/**: Capa de datos con dos aproximaciones:
  - **Mongoose (MongoDB)**: Para Noticias, Agenda y CITA (`MongoNews.js`, `Cita.js`).
  - **Logic-as-Model**: Para SGI y RESPEL, donde el modelo inyecta HTML directamente en archivos.
- **routes/**: Define los puntos de entrada (endpoints) de la API REST para el panel de administración.

## Flujo de Datos (NoSQL)
1. **Petición**: El Navegador hace `POST` / `GET` a una ruta de la API.
2. **Router**: Dirige la petición al Controlador correspondiente.
3. **Controlador**: Procesa archivos (Multer) y solicita persistencia al Modelo.
4. **Modelo**: Guarda o consulta datos en la instancia de **MongoDB**.
5. **Respuesta**: El controlador envía una respuesta JSON de éxito o error al cliente.
