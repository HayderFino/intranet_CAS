<?php
// ============================================================
// Script 2: Migrar datos JSON existentes a PostgreSQL
// Ejecutar desde el navegador: http://localhost/CAS/intranet_CAS/intranet/sql/02_migrar_datos.php
// ============================================================

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../database.php';

echo "<html><head><title>Migración a PostgreSQL</title>
<style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 2rem auto; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    h1 { color: #38bdf8; border-bottom: 2px solid #1e3a5f; padding-bottom: 1rem; }
    h2 { color: #34d399; margin-top: 2rem; }
    .success { color: #34d399; }
    .error { color: #f87171; }
    .warning { color: #fbbf24; }
    .info { color: #60a5fa; }
    .box { background: #1e293b; border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0; border-left: 4px solid #3b82f6; }
    .box.ok { border-left-color: #10b981; }
    .box.err { border-left-color: #ef4444; }
    .box.warn { border-left-color: #f59e0b; }
    pre { background: #1e293b; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
    .counter { display: inline-block; background: #3b82f6; color: white; padding: 2px 10px; border-radius: 12px; font-weight: 700; margin-left: 8px; }
</style>
</head><body>";

echo "<h1>🚀 Migración de Datos JSON → PostgreSQL</h1>";

try {
    $pdo = Database::getConnection();
    echo "<div class='box ok'><span class='success'>✅ Conexión a PostgreSQL exitosa</span> — Base de datos: <strong>intranet_cas</strong></div>";
} catch (Exception $e) {
    echo "<div class='box err'><span class='error'>❌ Error de conexión: " . htmlspecialchars($e->getMessage()) . "</span></div>";
    echo "<p class='warning'>⚠️ Asegúrate de que PostgreSQL está corriendo y que la base de datos 'intranet_cas' existe.</p>";
    echo "<p class='info'>Ejecuta primero el script SQL: <code>sql/01_crear_base_datos.sql</code></p>";
    echo "</body></html>";
    exit;
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function load_json($path) {
    if (!file_exists($path)) return [];
    $data = json_decode(file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function migrate_log($msg, $type = 'info') {
    $icons = ['info' => 'ℹ️', 'success' => '✅', 'error' => '❌', 'warning' => '⚠️', 'skip' => '⏭️'];
    echo "<div style='margin: 4px 0; padding-left: 1.5rem;'><span class='{$type}'>{$icons[$type]} {$msg}</span></div>";
    ob_flush(); flush();
}

$BASE_DIR = realpath(__DIR__ . '/..');

// ============================================================
// CREAR TABLAS (por si no se ejecutó el SQL primero)
// ============================================================
echo "<h2>📋 Paso 1: Verificar / Crear Tablas</h2>";

$schema_queries = [
    'users' => "CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        permissions JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    'news' => "CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    'events' => "CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_date TIMESTAMP,
        location TEXT,
        image_url TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    'banners' => "CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Banner',
        image_url TEXT,
        link_url TEXT,
        file_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    'directory' => "CREATE TABLE IF NOT EXISTS directory (
        id VARCHAR(255) PRIMARY KEY,
        full_name VARCHAR(255),
        position VARCHAR(255),
        department VARCHAR(255),
        extension VARCHAR(50),
        email VARCHAR(255)
    )",
    'agenda' => "CREATE TABLE IF NOT EXISTS agenda (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP,
        end_time TIMESTAMP
    )"
];

foreach ($schema_queries as $table => $sql) {
    try {
        $pdo->exec($sql);
        migrate_log("Tabla <strong>{$table}</strong> — OK", 'success');
    } catch (PDOException $e) {
        migrate_log("Error creando tabla {$table}: " . $e->getMessage(), 'error');
    }
}

// Asegurar columna file_url en banners (puede faltar en esquemas antiguos)
try {
    $pdo->exec("ALTER TABLE banners ADD COLUMN IF NOT EXISTS file_url TEXT");
    migrate_log("Columna <strong>banners.file_url</strong> verificada", 'success');
} catch (PDOException $e) {
    // Ya existe, ignorar
}

// Crear índices
$indexes = [
    "CREATE INDEX IF NOT EXISTS idx_news_created_at ON news (created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners (is_active)",
];
foreach ($indexes as $idx) {
    try { $pdo->exec($idx); } catch (PDOException $e) { /* ignorar */ }
}
migrate_log("Índices creados", 'success');

// ============================================================
// MIGRAR USUARIOS
// ============================================================
echo "<h2>👤 Paso 2: Migrar Usuarios</h2>";

$users = load_json($BASE_DIR . '/default_user.json');
$count = 0;
$skipped = 0;

foreach ($users as $u) {
    $id = $u['id'] ?? $u['_id'] ?? uniqid();
    if (is_array($id) && isset($id['$oid'])) $id = $id['$oid'];
    
    $username = $u['username'] ?? '';
    if (!$username) { migrate_log("Usuario sin username, omitido", 'skip'); continue; }

    // Verificar si ya existe
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$username]);
    if ($check->fetch()) {
        migrate_log("Usuario <strong>{$username}</strong> ya existe, omitido", 'skip');
        $skipped++;
        continue;
    }

    $permissions = $u['permissions'] ?? new stdClass();
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (id, username, password_hash, display_name, role, permissions, created_at) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $username,
            $u['password'] ?? '',
            $u['displayName'] ?? $username,
            $u['role'] ?? 'admin',
            json_encode($permissions),
            $u['createdAt'] ?? date('c')
        ]);
        $count++;
        migrate_log("Usuario <strong>{$username}</strong> ({$u['role']}) migrado", 'success');
    } catch (PDOException $e) {
        migrate_log("Error migrando usuario {$username}: " . $e->getMessage(), 'error');
    }
}
echo "<div class='box ok'>Usuarios migrados: <span class='counter'>{$count}</span> | Omitidos: <span class='counter'>{$skipped}</span></div>";

// ============================================================
// MIGRAR NOTICIAS
// ============================================================
echo "<h2>📰 Paso 3: Migrar Noticias</h2>";

$news = load_json($BASE_DIR . '/data/noticias.json');
$count = 0;
$skipped = 0;

foreach ($news as $n) {
    $id = $n['id'] ?? uniqid();

    $check = $pdo->prepare("SELECT id FROM news WHERE id = ?");
    $check->execute([$id]);
    if ($check->fetch()) {
        $skipped++;
        continue;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO news (id, title, description, image_url, category, created_at) 
                               VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $n['title'] ?? 'Sin título',
            $n['description'] ?? '',
            $n['imageUrl'] ?? '',
            $n['category'] ?? '',
            $n['createdAt'] ?? date('c')
        ]);
        $count++;
    } catch (PDOException $e) {
        migrate_log("Error migrando noticia {$id}: " . $e->getMessage(), 'error');
    }
}

if ($count > 0) {
    migrate_log("Noticias migradas exitosamente", 'success');
}
if ($skipped > 0) {
    migrate_log("{$skipped} noticias ya existían, omitidas", 'skip');
}
echo "<div class='box ok'>Noticias migradas: <span class='counter'>{$count}</span> | Omitidas: <span class='counter'>{$skipped}</span></div>";

// ============================================================
// MIGRAR EVENTOS
// ============================================================
echo "<h2>📅 Paso 4: Migrar Eventos</h2>";

$eventos = load_json($BASE_DIR . '/data/eventos.json');
$count = 0;
$skipped = 0;

foreach ($eventos as $e) {
    $id = $e['id'] ?? uniqid();

    $check = $pdo->prepare("SELECT id FROM events WHERE id = ?");
    $check->execute([$id]);
    if ($check->fetch()) {
        $skipped++;
        continue;
    }

    // Mapear campos del JSON frontend al esquema de BD
    $title = $e['titulo'] ?? $e['title'] ?? 'Sin título';
    $description = $e['descripcion'] ?? $e['description'] ?? '';
    $event_date = $e['fecha'] ?? $e['eventDate'] ?? $e['event_date'] ?? null;
    $location = $e['lugar'] ?? $e['location'] ?? '';
    $image_url = $e['acento'] ?? $e['imageUrl'] ?? $e['image_url'] ?? '';
    $category = $e['tipo'] ?? $e['category'] ?? '';

    try {
        $stmt = $pdo->prepare("INSERT INTO events (id, title, description, event_date, location, image_url, category, created_at) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $title,
            $description,
            $event_date,
            $location,
            $image_url,
            $category,
            $e['createdAt'] ?? date('c')
        ]);
        $count++;
        migrate_log("Evento <strong>{$title}</strong> migrado", 'success');
    } catch (PDOException $e2) {
        migrate_log("Error migrando evento {$id}: " . $e2->getMessage(), 'error');
    }
}
echo "<div class='box ok'>Eventos migrados: <span class='counter'>{$count}</span> | Omitidos: <span class='counter'>{$skipped}</span></div>";

// ============================================================
// MIGRAR BANNERS
// ============================================================
echo "<h2>🖼️ Paso 5: Migrar Banners</h2>";

$banners = load_json($BASE_DIR . '/data/banner.json');
$count = 0;
$skipped = 0;

if (empty($banners)) {
    echo "<div class='box warn'><span class='warning'>⚠️ No hay banners para migrar (banner.json está vacío)</span></div>";
} else {
    foreach ($banners as $b) {
        $id = $b['id'] ?? uniqid();

        $check = $pdo->prepare("SELECT id FROM banners WHERE id = ?");
        $check->execute([$id]);
        if ($check->fetch()) {
            $skipped++;
            continue;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO banners (id, title, image_url, link_url, file_url, is_active, created_at) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $b['title'] ?? 'Banner',
                $b['imageUrl'] ?? $b['image_url'] ?? '',
                $b['linkUrl'] ?? $b['link_url'] ?? '',
                $b['fileUrl'] ?? $b['file_url'] ?? '',
                isset($b['isActive']) ? ($b['isActive'] ? 'true' : 'false') : 'true',
                $b['createdAt'] ?? date('c')
            ]);
            $count++;
        } catch (PDOException $e) {
            migrate_log("Error migrando banner {$id}: " . $e->getMessage(), 'error');
        }
    }
    echo "<div class='box ok'>Banners migrados: <span class='counter'>{$count}</span> | Omitidos: <span class='counter'>{$skipped}</span></div>";
}

// ============================================================
// MIGRAR DIRECTORIO
// ============================================================
echo "<h2>📇 Paso 6: Migrar Directorio</h2>";

$directorio = load_json($BASE_DIR . '/data/directorio.json');
$count = 0;
$skipped = 0;

foreach ($directorio as $d) {
    $id = $d['id'] ?? uniqid();

    $check = $pdo->prepare("SELECT id FROM directory WHERE id = ?");
    $check->execute([$id]);
    if ($check->fetch()) {
        $skipped++;
        continue;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO directory (id, full_name, position, department, extension, email) 
                               VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $d['nombre'] ?? $d['full_name'] ?? $d['name'] ?? '',
            $d['cargo'] ?? $d['position'] ?? '',
            $d['dependencia'] ?? $d['department'] ?? '',
            $d['extension'] ?? '',
            $d['correo'] ?? $d['email'] ?? ''
        ]);
        $count++;
        $name = $d['nombre'] ?? $d['full_name'] ?? 'Sin nombre';
        migrate_log("Contacto <strong>{$name}</strong> migrado", 'success');
    } catch (PDOException $e) {
        migrate_log("Error migrando directorio {$id}: " . $e->getMessage(), 'error');
    }
}
echo "<div class='box ok'>Directorio migrados: <span class='counter'>{$count}</span> | Omitidos: <span class='counter'>{$skipped}</span></div>";

// ============================================================
// MIGRAR AGENDA
// ============================================================
echo "<h2>📋 Paso 7: Migrar Agenda</h2>";

$agenda = load_json($BASE_DIR . '/data/agenda.json');

if (empty($agenda)) {
    echo "<div class='box warn'><span class='warning'>⚠️ No hay items de agenda para migrar (agenda.json está vacío)</span></div>";
} else {
    $count = 0;
    $skipped = 0;

    foreach ($agenda as $a) {
        $id = $a['id'] ?? uniqid();

        $check = $pdo->prepare("SELECT id FROM agenda WHERE id = ?");
        $check->execute([$id]);
        if ($check->fetch()) {
            $skipped++;
            continue;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO agenda (id, title, description, start_time, end_time) 
                                   VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $a['title'] ?? 'Sin título',
                $a['description'] ?? '',
                $a['startTime'] ?? $a['start_time'] ?? $a['time'] ?? null,
                $a['endTime'] ?? $a['end_time'] ?? null
            ]);
            $count++;
        } catch (PDOException $e) {
            migrate_log("Error migrando agenda {$id}: " . $e->getMessage(), 'error');
        }
    }
    echo "<div class='box ok'>Agenda migrados: <span class='counter'>{$count}</span> | Omitidos: <span class='counter'>{$skipped}</span></div>";
}

// ============================================================
// RESUMEN FINAL
// ============================================================
echo "<h2>📊 Resumen Final</h2>";

$tables = ['users', 'news', 'events', 'banners', 'directory', 'agenda'];
echo "<div class='box ok'><table style='width:100%; border-collapse: collapse;'>";
echo "<tr style='border-bottom: 1px solid #334155;'><th style='text-align:left; padding: 8px;'>Tabla</th><th style='text-align:right; padding: 8px;'>Registros</th></tr>";

$total = 0;
foreach ($tables as $t) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as c FROM {$t}");
        $row = $stmt->fetch();
        $c = $row['c'];
        $total += $c;
        echo "<tr style='border-bottom: 1px solid #1e293b;'><td style='padding: 8px;'>{$t}</td><td style='text-align:right; padding: 8px;'><span class='counter'>{$c}</span></td></tr>";
    } catch (PDOException $e) {
        echo "<tr><td style='padding: 8px;'>{$t}</td><td style='text-align:right; padding: 8px;'><span class='error'>Error</span></td></tr>";
    }
}
echo "<tr style='border-top: 2px solid #3b82f6;'><td style='padding: 8px; font-weight: bold;'>TOTAL</td><td style='text-align:right; padding: 8px;'><span class='counter'>{$total}</span></td></tr>";
echo "</table></div>";

echo "<div class='box ok' style='margin-top: 2rem; text-align: center;'>
    <h3 class='success'>🎉 ¡Migración completada!</h3>
    <p>La base de datos PostgreSQL está lista. La API ya puede leer estos datos.</p>
    <p style='color: #94a3b8; font-size: 0.85rem;'>Este script es seguro de ejecutar múltiples veces — no duplica registros existentes.</p>
</div>";

echo "</body></html>";
