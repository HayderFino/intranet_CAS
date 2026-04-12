# 🚀 Guía de Despliegue — Intranet CAS (PHP/XAMPP)

Esta guía explica paso a paso cómo poner en marcha el proyecto desde cero en un nuevo entorno.

> [!IMPORTANT]
> El proyecto funciona sobre **PHP + Apache (XAMPP)**. **No se necesita Node.js, npm, MongoDB ni ninguna base de datos externa.**

---

## 📋 Requisitos Previos

| Requisito | Versión mínima | Descarga |
|:----------|:--------------|:---------|
| **XAMPP** (Apache + PHP) | 8.0+ | [apachefriends.org](https://www.apachefriends.org) |
| **Git** | Cualquiera (opcional) | [git-scm.com](https://git-scm.com) |

---

## 🛠️ Paso 1: Obtener el Proyecto

### Opción A — Clonar desde GitHub
```bash
cd C:\xampp\htdocs\CAS
git clone https://github.com/HayderFino/intranet_CAS.git
```

### Opción B — Descarga manual
Descarga el ZIP del repositorio y descomprime en `C:\xampp\htdocs\CAS\intranet_CAS\`.

La estructura resultante debe ser:
```
C:\xampp\htdocs\CAS\intranet_CAS\
├── documentacion\
├── intranet\
│   ├── api.php
│   ├── .htaccess
│   ├── default_user.json
│   └── ...
└── README.md
```

---

## ⚙️ Paso 2: Configurar Apache

### Verificar que `mod_rewrite` esté activo
1. Abrir `C:\xampp\apache\conf\httpd.conf`
2. Buscar la línea `#LoadModule rewrite_module modules/mod_rewrite.so`
3. Eliminar el `#` si está comentada
4. Cambiar `AllowOverride None` a `AllowOverride All` en la sección de `htdocs`
5. Reiniciar Apache desde el Panel de Control XAMPP

El archivo `.htaccess` del proyecto (ya incluido en `/intranet/`) enruta automáticamente toda petición `/api/*` hacia `api.php`.

---

## ▶️ Paso 3: Lanzar la Aplicación

1. Abrir el **Panel de Control de XAMPP**
2. Iniciar el módulo **Apache**
3. Abrir el navegador y navegar a:

```
http://localhost/CAS/intranet_CAS/intranet/
```

No se necesita ningún comando de terminal, instalación de paquetes ni inicialización de base de datos. El sistema arranca inmediatamente.

---

## 🔐 Acceso al Panel de Administración

```
http://localhost/CAS/intranet_CAS/intranet/administracion/login.html
```

### Credenciales por defecto

| Campo | Valor |
|:------|:------|
| **Usuario** | `Admin` |
| **Contraseña** | `1234` |
| **Rol** | `superadmin` (acceso total) |

> [!CAUTION]
> Cambia la contraseña del usuario `Admin` inmediatamente después del primer inicio de sesión desde la sección **Gestión de Usuarios** del panel.

---

## 📂 Archivos de Datos (No Borrar)

Los siguientes archivos y carpetas contienen toda la información dinámica del sistema:

| Ruta | Contenido |
|:-----|:----------|
| `intranet/default_user.json` | Usuarios y contraseñas hasheadas (bcrypt) |
| `intranet/data/noticias.json` | Noticias NotiCAS |
| `intranet/data/eventos.json` | Eventos institucionales |
| `intranet/data/agenda.json` | Agenda CAS |
| `intranet/data/banner.json` | Banners del portal |
| `intranet/data/directorio.json` | Directorio de contactos |
| `intranet/data/menu header/` | Documentos SGI, GIT, CAS (PDFs, Word) |
| `intranet/data/Herramientas/` | Datos RESPEL, RUA, PCB |
| `intranet/data/imagenes/` | Imágenes subidas por el panel |

---

## 🧪 Verificar que la API funciona

Abrir en el navegador:
```
http://localhost/CAS/intranet_CAS/intranet/api/test-server
```

Respuesta esperada:
```json
{
  "status": "ok",
  "engine": "PHP",
  "time": "2026-04-12T..."
}
```

---

## 🔄 Respaldo del Sistema

Como toda la información está en archivos (sin base de datos), el respaldo es simple:

```powershell
# Copiar toda la carpeta data y el archivo de usuarios
xcopy "C:\xampp\htdocs\CAS\intranet_CAS\intranet\data" "D:\Backup\intranet_data\" /E /I /Y
copy "C:\xampp\htdocs\CAS\intranet_CAS\intranet\default_user.json" "D:\Backup\"
```

> [!TIP]
> Programe este backup para ejecutarse diariamente. No se necesita `mongodump` ni ninguna herramienta especial.
