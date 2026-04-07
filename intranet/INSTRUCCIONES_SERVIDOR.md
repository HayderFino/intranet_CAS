# Instrucciones de Configuración del Servidor

Para que las dos aplicaciones (tanto las tuyas en PHP como esta intranet en Node.js) puedan funcionar al mismo tiempo sin entrar en conflicto, la mejor solución es decirles que atiendan por puertos diferentes.

## Solución Recomendada: Usar puertos separados (¡La más sencilla y rápida!)

No necesitas ninguna configuración de Proxy Inverso en Apache para esto. Simplemente dejamos a Apache (PHP) y a Node.js trabajando por caminos separados:

1. **Para usar tu resto de apps (PHP o HTML corrientes):**
   Asegúrate de que Apache esté encendido en XAMPP y entras por la forma normal (ej: `http://localhost/tus-apps/`). Aquí funciona el puerto 80 automático de Apache.

2. **Para usar la Intranet CAS (Node.js):**
   Ve a la terminal (dentro de esta carpeta `intranet`), enciéndela ejecutando:
   ```bash
   node server.js
   ```
   Y entra especificando su puerto: **`http://localhost:3000/`**

¿Por qué es lo mejor? Porque al especificar el `:3000` en tu navegador, Apache no interfiere en absoluto. Ambas aplicaciones pueden estar encendidas al mismo tiempo y funcionar perfectamente a la vez en la misma computadora.

> **Nota para Administradores:** Al usar este método directo (puerto 3000), el botón "Volver al Sitio" en el panel de administración (`/administracion/`) funcionará correctamente de vuelta a la portada, eliminando el fallo 404 del Proxy.
