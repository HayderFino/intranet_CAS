# Guía de Navegación y Descripción del Sistema
## 🌐 Portal de Intranet CAS

Este documento proporciona una descripción detallada de la interfaz de usuario, la estructura de navegación y las funcionalidades principales del Portal de Intranet de la **Corporación Autónoma Regional de Santander (CAS)**.

---

## 1. Descripción General

La Intranet CAS es una plataforma centralizada y dinámica diseñada bajo una estética profesional ("Premium Design"). Combina un frontend ágil en HTML5/CSS3 con un backend robusto en Node.js y MongoDB, permitiendo que la información institucional esté siempre actualizada y accesible para todos los funcionarios.

**Características principales:**
- **Interactividad**: Menús desplegables y componentes reactivos.
- **Gestión Dinámica**: Contenidos de noticias, agenda y manuales técnicos controlados desde un panel administrativo.
- **Diseño Adaptativo**: Optimizado para su visualización en diferentes dispositivos y resoluciones.

---

## 2. Estructura de Navegación

El portal utiliza un sistema de navegación dual (Lateral y Superior) para maximizar la usabilidad.

### 2.1. Barra Lateral (Sidebar - Herramientas Rápidas)
Ubicada a la izquierda, ofrece acceso directo a las herramientas técnicas transversales del día a día:
- **NotiCAS**: Repositorio de noticias institucionales.
- **RESPEL / RUA / PCB**: Módulos de gestión ambiental especializados.
- **Cartografía en Línea**: Enlace a servicios geográficos.
- **Servicios de Apoyo**: Soporte técnico, Correo institucional y Calendario.
- **Búsqueda Avanzada**: Herramienta de localización de documentos.

### 2.2. Menú Superior (Top Nav - Estructura Institucional)
Organizado en menús desplegables por áreas estratégicas:

1.  **La CAS**: Información institucional (Misión, Visión, Objetivos, Funciones, Estructura Organizacional y **Talento Humano** con secciones dedicadas a Convocatorias y Planes).
2.  **SGI (Sistema de Gestión Integrado)**: Acceso a los cuatro tipos de procesos, políticas de calidad, manuales SGI y documentos institucionales.
3.  **GIT (Grupo de Infraestructura Tecnológica)**: Normatividad TIC, Gobierno Digital, **Manuales de Usuario** (CITA, SIRH, SNIF, Revisión de Red) y Boletines de Seguridad.
4.  **MECI / Administración**: Acceso rápido al Modelo Estándar de Control Interno y botón de ingreso al Panel de Gestión.

---

## 3. Áreas de Contenido del Dashboard

Al ingresar al portal (Inicio), el usuario se encuentra con:

- **Breadcrumbs (Migas de Pan)**: Ubicados bajo la cabecera para indicar siempre la ruta de navegación actual.
- **Grid de Procesos**: Cuatro tarjetas interactivas que segmentan el SGI en:
  - **Estratégicos**: Direccionamiento institucional.
  - **Misionales**: Autoridad ambiental.
  - **Apoyo**: Recursos y TIC.
  - **Evaluación**: Control y mejora.
- **Sección de Noticias**: Un carrusel dinámico que muestra las últimas publicaciones de la corporación gestionadas vía MongoDB.
- **Enlaces de Acceso Rápido**: Accesos visuales con iconos para Boletines, Manuales, Protección de Datos e Informes de Gestión.
- **Mapa de Procesos**: Visualización gráfica de la interacción institucional al final de la página de inicio.

---

## 4. El Panel de Administración (Ingreso)

Haciendo clic en el botón **"Ingresar"** en la parte superior derecha, los administradores autorizados acceden a la consola de gestión, la cual permite:
- Publicar y editar noticias en tiempo real.
- Subir y categorizar manuales técnicos (CITA).
- Gestionar documentos de **Provisión de Empleos**, **SNIF** y **Revisión de Red**.
- Actualizar calendarios y agendas.
- Gestionar la documentación masiva del SGI sin necesidad de programar.

---

> [!TIP]
> **Ayuda de Navegación**: Si en algún momento se pierde dentro de las subsecciones, puede hacer clic en el logotipo de la CAS o en la palabra **"Inicio"** del menú superior para volver a la pantalla principal.
