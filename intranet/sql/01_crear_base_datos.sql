-- ============================================================
-- Script 1: Crear la base de datos y el esquema completo
-- Base de datos: intranet_cas
-- Motor: PostgreSQL 
-- ============================================================
-- INSTRUCCIONES:
--   1. Abrir pgAdmin o psql
--   2. Ejecutar primero la línea CREATE DATABASE conectado a 'postgres'
--   3. Luego conectarse a 'intranet_cas' y ejecutar el resto
-- ============================================================

-- Paso 1: Crear la base de datos (ejecutar conectado a 'postgres')
CREATE DATABASE intranet_cas
WITH ENCODING = 'UTF8'
LC_COLLATE = 'Spanish_Colombia.1252'
LC_CTYPE = 'Spanish_Colombia.1252'
TEMPLATE = template0;

-- ============================================================
-- Paso 2: Conectarse a intranet_cas y ejecutar lo siguiente
-- ============================================================

-- Extensión para UUIDs (opcional, por si se necesita en el futuro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: users
-- Almacena los usuarios del sistema con roles y permisos
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(255) PRIMARY KEY,
    username        VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    role            VARCHAR(50) DEFAULT 'admin',
    permissions     JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Usuarios del sistema de administración de la intranet';
COMMENT ON COLUMN users.permissions IS 'Permisos por módulo en formato JSON: {"banner": true, "news": false, ...}';
COMMENT ON COLUMN users.role IS 'Roles: superadmin, admin';

-- ============================================================
-- TABLA: news
-- Noticias de la intranet
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
    id              VARCHAR(255) PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    image_url       TEXT,
    category        VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE news IS 'Noticias publicadas en la intranet';

-- ============================================================
-- TABLA: events
-- Eventos y agenda de la CAS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id              VARCHAR(255) PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    event_date      TIMESTAMP,
    location        TEXT,
    image_url       TEXT,
    category        VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE events IS 'Eventos y agenda de la Corporación';

-- ============================================================
-- TABLA: banners
-- Banners del carrusel principal
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
    id              VARCHAR(255) PRIMARY KEY,
    title           TEXT NOT NULL DEFAULT 'Banner',
    image_url       TEXT,
    link_url        TEXT,
    file_url        TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE banners IS 'Banners del carrusel de la página principal';

-- ============================================================
-- TABLA: directory
-- Directorio de funcionarios
-- ============================================================
CREATE TABLE IF NOT EXISTS directory (
    id              VARCHAR(255) PRIMARY KEY,
    full_name       VARCHAR(255),
    position        VARCHAR(255),
    department      VARCHAR(255),
    extension       VARCHAR(50),
    email           VARCHAR(255)
);

COMMENT ON TABLE directory IS 'Directorio de contactos y funcionarios de la CAS';

-- ============================================================
-- TABLA: agenda
-- Agenda general de actividades
-- ============================================================
CREATE TABLE IF NOT EXISTS agenda (
    id              VARCHAR(255) PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    start_time      TIMESTAMP,
    end_time        TIMESTAMP
);

COMMENT ON TABLE agenda IS 'Agenda de actividades programadas';

-- ============================================================
-- Índices para mejorar rendimiento de consultas frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners (is_active);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- ============================================================
-- Verificación
-- ============================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
