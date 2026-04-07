# Implementación de NoSQL "Estática" (Embebida) vs Servidor
## 📂 Análisis de Alternativas para la Intranet CAS

Originalmente se consideró el uso de bases de datos NoSQL embebidas para mantener el proyecto sin dependencias externas. Sin embargo, para la **Intranet CAS** se ha optado por un **Servidor de MongoDB (v7.0+)**.

---

## 1. ¿Por qué se consideró la opción Embebida?

Las bases de datos embebidas como **NeDB** o **AxioDB** permiten que los datos se guarden en archivos locales sin necesidad de instalar un servicio de base de datos.
- **Ventaja**: Portabilidad máxima (copiar y pegar la carpeta).
- **Desventaja**: Menos herramientas de administración y menor robustez para concurrencia.

---

## 2. Decisión Final: MongoDB Server (Elegida)

Se decidió implementar **MongoDB Server con Mongoose** por las siguientes razones:

1.  **Escalabilidad**: El portal maneja noticias, eventos de agenda y ahora un robusto sistema de manuales CITA. MongoDB maneja grandes volúmenes de datos con mayor eficiencia.
2.  **Herramientas de Gestión**: Permite el uso de herramientas como **MongoDB Compass** para auditoría y correcciones rápidas de datos fuera del código.
3.  **Estándar de la Industria**: Al ser el estándar para Node.js, facilita que futuros desarrolladores mantengan el sistema.
4.  **Seguridad y Backups**: Ofrece mecanismos profesionales para exportar datos (`mongodump`).

---

## 3. Comparativa de Implementación

| Característica | Embebido (NeDB/Axio) | MongoDB Server (Implementado) |
| :--- | :--- | :--- |
| **Instalación** | Ninguna (npm install) | Requiere instalar MongoDB Community |
| **Persistencia** | Archivo `.db` local | Base de datos administrada por servicio |
| **Consultas** | Limitadas | Full features (Aggregations, Geo, etc) |
| **Mantenibilidad** | Dificultad media | Alta (vía Compass/Shell) |

---

## 4. Estado Actual

El proyecto utiliza **Mongoose** conectado a `mongodb://127.0.0.1:27017/intranet_cas`. Los modelos están centralizados en `intranet/src/models/`, permitiendo que si en el futuro se desea cambiar a otra base de datos, el impacto en la lógica sea mínimo.

---

> [!IMPORTANT]
> **Nota para el Administrador**: Para que la Intranet funcione correctamente, el servicio de MongoDB debe estar activo en el servidor central. Si el servidor se apaga o el servicio se detiene, las secciones de Noticias, Agenda y CITA no cargarán datos.
