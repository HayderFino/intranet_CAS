<?php
/**
 * ============================================================
 *  API UNIVERSAL - INTRANET CAS
 *  Reemplaza completamente Node.js / Express
 *  Autor: Migración PHP — Apache/XAMPP
 * ============================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$route = trim($_GET['route'] ?? '', '/');
$method = $_SERVER['REQUEST_METHOD'];

// Detectar la ruta base del proyecto de forma dinámica (ej: /intranet_CAS/intranet)
$baseDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
define('WEB_BASE_PATH', $baseDir . '/');

// Define the root directory for data (absolute on disk)
define('DATA_ROOT', __DIR__ . '/');



// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

function out($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}

function body()
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function auth($superadmin = false)
{
    if (!isset($_SESSION['userId']))
        out(['message' => 'No autorizado'], 401);
    if ($superadmin && ($_SESSION['role'] ?? '') !== 'superadmin')
        out(['message' => 'Requiere Super Admin'], 403);
}

/**  Decode HTML entities → real chars  */
function dent($s)
{
    static $m = [
    '&oacute;' => 'ó',
    '&aacute;' => 'á',
    '&eacute;' => 'é',
    '&iacute;' => 'í',
    '&uacute;' => 'ú',
    '&ntilde;' => 'ñ',
    '&Oacute;' => 'Ó',
    '&Aacute;' => 'Á',
    '&Eacute;' => 'É',
    '&Iacute;' => 'Í',
    '&Uacute;' => 'Ú',
    '&Ntilde;' => 'Ñ',
    '&iquest;' => '¿',
    '&amp;' => '&',
    '&ndash;' => '–'
    ];
    return str_replace(array_keys($m), array_values($m), (string) $s);
}

/**  Encode real chars → HTML entities  */
function eent($s)
{
    static $m = [
    'ó' => '&oacute;',
    'á' => '&aacute;',
    'é' => '&eacute;',
    'í' => '&iacute;',
    'ú' => '&uacute;',
    'ñ' => '&ntilde;',
    'Ó' => '&Oacute;',
    'Á' => '&Aacute;',
    'É' => '&Eacute;',
    'Í' => '&Iacute;',
    'Ú' => '&Uacute;',
    'Ñ' => '&Ntilde;',
    '¿' => '&iquest;',
    '–' => '&ndash;'
    ];
    return str_replace(array_keys($m), array_values($m), (string) $s);
}

/**  Read JSON file safely  */
function read_json($path)
{
    if (!file_exists($path))
        return [];
    return json_decode(file_get_contents($path), true) ?? [];
}

/**  Write JSON file safely  */
function write_json($path, $data)
{
    file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

/**  Upload a file from $_FILES[$field] to $destDir, return relative URL  */
function upload_file($field, $destDir)
{
    if (!isset($_FILES[$field]))
        return null;
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK)
        return null;

    $dir = __DIR__ . '/' . ltrim($destDir, '/');
    if (!is_dir($dir))
        mkdir($dir, 0777, true);

    $cleanName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $f['name']);
    $name = time() . '-' . $cleanName;

    if (move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) {
        return ltrim($destDir, '/') . '/' . $name;
    }
    return null;
}

/**  Strip a block with data-id from an HTML file  */
function html_remove_block($htmlPath, $id, $pattern)
{
    $content = file_get_contents($htmlPath);
    $escaped = preg_quote($id, '/');
    $regex = str_replace('__ID__', $escaped, $pattern);
    $match = [];
    if (preg_match($regex, $content, $match)) {
        // Try to delete physical file referenced in href/src
        if (preg_match('/(?:href|src)="([^"]+)"/i', $match[0], $fh)) {
            $rel = $fh[1];
            if ($rel && $rel !== '#' && strpos($rel, 'http') === false) {
                $abs = realpath(__DIR__ . '/' . ltrim(str_replace('../../', '', $rel), '/'));
                if ($abs && file_exists($abs))
                    @unlink($abs);
            }
        }
        $content = preg_replace($regex, '', $content, 1);
        file_put_contents($htmlPath, $content);
        return true;
    }
    return false;
}

/**  Get items with data-id="…" from an HTML file using a regex  */
function html_get_items($htmlPath, $itemRegex, $cb)
{
    if (!file_exists($htmlPath))
        return [];
    $content = file_get_contents($htmlPath);
    preg_match_all($itemRegex, $content, $matches, PREG_SET_ORDER);
    $items = [];
    foreach ($matches as $m)
        $items[] = $cb($m);
    return $items;
}

// ══════════════════════════════════════════════════════════════
//  1. AUTH
// ══════════════════════════════════════════════════════════════

if ($route === 'auth/login' && $method === 'POST') {
    $in = body();
    $users = read_json(__DIR__ . '/default_user.json');
    foreach ($users as $u) {
        if ($u['username'] === ($in['username'] ?? '') && password_verify($in['password'] ?? '', $u['password'])) {
            $_SESSION['userId'] = $u['_id'] ?? uniqid();
            $_SESSION['displayName'] = $u['displayName'];
            $_SESSION['role'] = $u['role'];
            $_SESSION['permissions'] = $u['permissions'];
            out([
                'success' => true,
                'user' => [
                    'username' => $u['username'],
                    'displayName' => $u['displayName'],
                    'role' => $u['role'],
                    'permissions' => $u['permissions'],
                ]
            ]);
        }
    }
    out(['success' => false, 'message' => 'Credenciales inválidas'], 401);
}

if ($route === 'auth/logout') {
    session_destroy();
    out(['success' => true]);
}

if ($route === 'auth/check') {
    if (isset($_SESSION['userId']))
        out([
            'success' => true,
            'user' => [
                'displayName' => $_SESSION['displayName'],
                'role' => $_SESSION['role'],
                'permissions' => $_SESSION['permissions'],
            ]
        ]);
    out(['success' => false], 401);
}

// ══════════════════════════════════════════════════════════════
//  2. SIMPLE JSON CRUD  (news, eventos, banner, directorio, users)
// ══════════════════════════════════════════════════════════════

$JSON_MAP = [
    'news' => 'data/noticias.json',
    'eventos' => 'data/eventos.json',
    'banner' => 'data/banner.json',
    'directorio' => 'data/directorio.json',
    'users' => 'default_user.json',
    'agenda' => 'data/agenda.json',
];

foreach ($JSON_MAP as $key => $file) {
    $fullPath = __DIR__ . '/' . $file;

    // LIST
    if ($route === $key && $method === 'GET') {
        out(read_json($fullPath));
    }

    // CREATE
    if ($route === $key && $method === 'POST') {
        auth($key === 'users');
        $in = body();
        $data = read_json($fullPath);
        if ($key === 'users')
            $in['password'] = password_hash($in['password'] ?? '', PASSWORD_BCRYPT);
        $in['id'] = uniqid();
        $in['createdAt'] = date('c');
        array_unshift($data, $in);
        write_json($fullPath, $data);
        out(['message' => 'Creado', 'id' => $in['id']], 201);
    }

    // UPDATE / DELETE by id
    if (preg_match('/^' . preg_quote($key, '/') . '\/([a-zA-Z0-9_\-\.]+)$/', $route, $m)) {
        auth($key === 'users');
        $id = $m[1];
        $data = read_json($fullPath);

        if ($method === 'DELETE') {
            $data = array_values(array_filter(
                $data,
                fn($i) =>
                ($i['id'] ?? $i['_id']['$oid'] ?? '') !== $id
            ));
            write_json($fullPath, $data);
            out(['message' => 'Eliminado']);
        }

        if ($method === 'PUT') {
            $in = body();
            foreach ($data as &$item) {
                $iid = $item['id'] ?? $item['_id']['$oid'] ?? '';
                if ($iid === $id) {
                    $item = array_merge($item, $in);
                    break;
                }
            }
            write_json($fullPath, $data);
            out(['message' => 'Actualizado']);
        }
    }
}

// ══════════════════════════════════════════════════════════════
//  3. IMAGE / FILE UPLOAD (generic)
// ══════════════════════════════════════════════════════════════

// /api/news/upload
if ($route === 'news/upload' && $method === 'POST') {
    auth();
    $url = upload_file('image', 'data/imagenes');
    if ($url)
        out(['imageUrl' => $url]);
    out(['message' => 'No se subió imagen'], 400);
}

// /api/banner/upload
if ($route === 'banner/upload' && $method === 'POST') {
    auth();
    $url = upload_file('image', 'data/imagenes');
    if ($url)
        out(['imageUrl' => $url]);
    out(['message' => 'Error'], 400);
}

// /api/sgi/upload   (section + category determine subfolder)
if ($route === 'sgi/upload' && $method === 'POST') {
    auth();
    $section = $_POST['section'] ?? 'planeacion';
    $category = $_POST['category'] ?? '';

    $sgiUploadBase = [
        'planeacion' => 'data/menu header/sgi/Procesos Estrategicos/Planeacion Estrategica',
        'mejora' => 'data/menu header/sgi/Procesos Estrategicos/mejora continua',
        'admin-recursos' => 'data/menu header/sgi/procesos misionales/Administracion de la Oferta de Recursos Naturales Renovables disponibles, Educacion Ambiental y Participacion Ciudadana',
        'planeacion-ambiental' => 'data/menu header/sgi/procesos misionales/Planeacion y Ordenamiento Ambiental',
        'vigilancia-control' => 'data/menu header/sgi/procesos misionales/Vigilancia, Seguimiento y Control Ambiental',
        'control-interno' => 'data/menu header/sgi/Evaluacion y Seguimiento/Control interno',
    ];

    $base = $sgiUploadBase[$section] ?? 'data/menu header/sgi';
    $dest = $category ? "$base/$category" : $base;
    $url = upload_file('file', $dest);
    if ($url)
        out(['fileUrl' => $url]);
    out(['message' => 'Error upload'], 400);
}

// ══════════════════════════════════════════════════════════════
//  4. SGI HTML-DB  /api/sgi/{section}[/{id}]
// ══════════════════════════════════════════════════════════════

$SGI_HTML = [
    'planeacion' => 'header_menu/sgi/planeacion-estrategica.html',
    'mejora' => 'header_menu/sgi/mejora-continua.html',
    'admin-recursos' => 'header_menu/sgi/admin-recursos.html',
    'planeacion-ambiental' => 'header_menu/sgi/planeacion-ambiental.html',
    'vigilancia-control' => 'header_menu/sgi/vigilancia-control.html',
    'control-interno' => 'header_menu/sgi/control-interno.html',
    'documentos' => 'header_menu/sgi/documentos.html',
    'talento-humano' => 'header_menu/sgi/talento-humano.html',
    'gestion-documental' => 'header_menu/sgi/gestion-documental.html',
    'gestion-financiera' => 'header_menu/sgi/gestion-financiera.html',
    'gestion-tecnologias' => 'header_menu/sgi/gestion-tecnologias.html',
    'juridico' => 'header_menu/sgi/juridico.html',
    'contratacion' => 'header_menu/sgi/contratacion.html',
    'gestion-integral' => 'header_menu/sgi/gestion-integral.html',
    'procesos-estrategicos' => 'header_menu/sgi/procesos-estrategicos.html',
    'procesos-misionales' => 'header_menu/sgi/procesos-misionales.html',
    'procesos-apoyo' => 'header_menu/sgi/procesos-apoyo.html',
    'control-disciplinario' => 'header_menu/sgi/control-disciplinario.html',
    'cobro-coactivo' => 'header_menu/sgi/cobro-coactivo.html',
    'bienes-servicios' => 'header_menu/sgi/bienes-servicios.html',
    'objetivos-calidad' => 'header_menu/sgi/objetivos-calidad.html',
    'politicas' => 'header_menu/sgi/politicas.html',
    'manuales' => 'header_menu/sgi/manuales.html',
];

if (preg_match('/^sgi\/([a-z0-9-]+)(?:\/([a-zA-Z0-9_\-]+))?$/', $route, $m)) {
    $section = $m[1];
    $id = $m[2] ?? null;
    $htmlRel = $SGI_HTML[$section] ?? null;
    $htmlPath = $htmlRel ? __DIR__ . '/' . $htmlRel : null;

    // GET list
    if ($method === 'GET' && $id === null) {
        if (!$htmlPath || !file_exists($htmlPath))
            out([]);
        $content = file_get_contents($htmlPath);

        // Parse categories (h3 positions) for context
        $cats = [];
        preg_match_all('/<h3[^>]*>(.*?)<\/h3>/is', $content, $catM, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);
        foreach ($catM as $c)
            $cats[] = ['pos' => $c[0][1], 'name' => dent(strip_tags($c[1][0]))];

        $items = [];
        $pattern = '/<a [^>]*class="file-item"[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i';
        preg_match_all($pattern, $content, $all, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);
        foreach ($all as $hit) {
            $outer = $hit[0][0];
            $pos = $hit[0][1];
            $iid = $hit[1][0];
            preg_match('/href="([^"]*)"/i', $outer, $hr);
            preg_match('/<div class="file-name">([\s\S]*?)<\/div>/i', $hit[2][0], $nm);

            // Find category: last h3 before this item
            $cat = '';
            foreach ($cats as $c) {
                if ($c['pos'] < $pos)
                    $cat = $c['name'];
            }

            $items[] = [
                'id' => $iid,
                'name' => trim(dent(strip_tags($nm[1] ?? 'Sin nombre'))),
                'href' => $hr[1] ?? '#',
                'fileUrl' => $hr[1] ?? '#',
                'category' => $cat,
            ];
        }
        out($items);
    }

    // POST create
    if ($method === 'POST' && $id === null) {
        auth();
        if (!$htmlPath || !file_exists($htmlPath))
            out(['message' => 'Section not found'], 404);
        $in = body();
        $newId = $in['id'] ?? time();
        $fileUrl = $in['fileUrl'] ?? '#';
        $name = $in['name'] ?? 'Sin nombre';
        $category = $in['category'] ?? '';

        $icon = '<div class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>';
        $newHtml = "\n<a href=\"$fileUrl\" target=\"_blank\" class=\"file-item\" data-id=\"$newId\">$icon<div><div class=\"file-name\">" . eent($name) . "</div><div class=\"file-meta\">PDF - Documento</div></div></a>";

        $content = file_get_contents($htmlPath);
        // Try both encoded and raw category names
        $catEnc = eent($category);
        $catRaw = $category;
        $inserted = false;

        foreach ([$catEnc, $catRaw] as $cat) {
            $esc = preg_quote($cat, '/');
            $regex = "/(<h3[^>]*>$esc<\/h3>[\s\S]*?<div [^>]*class=\"file-list-grid\"[^>]*>)/i";
            if (preg_match($regex, $content)) {
                $content = preg_replace($regex, '$1' . $newHtml, $content, 1);
                $inserted = true;
                break;
            }
        }

        if (!$inserted)
            out(['message' => 'Categoría no encontrada en HTML'], 404);
        file_put_contents($htmlPath, $content);
        out(['id' => $newId], 201);
    }

    // PUT update (delete + re-insert)
    if ($method === 'PUT' && $id) {
        auth();
        if (!$htmlPath || !file_exists($htmlPath))
            out(['message' => 'Section not found'], 404);
        $in = body();

        // Remove old
        $content = file_get_contents($htmlPath);
        $idEsc = preg_quote($id, '/');
        $delPat = '/<a [^>]*class="file-item"[^>]*data-id="' . $idEsc . '"[^>]*>[\s\S]*?<\/a>/i';
        $content = preg_replace($delPat, '', $content, 1);
        file_put_contents($htmlPath, $content);

        // Re-insert with new data
        $_SERVER['REQUEST_METHOD'] = 'POST_INTERNAL';
        $in['id'] = $id;
        $content = file_get_contents($htmlPath);
        $name = $in['name'] ?? 'Sin nombre';
        $fileUrl = $in['fileUrl'] ?? '#';
        $category = $in['category'] ?? '';
        $icon = '<div class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>';
        $newHtml = "\n<a href=\"$fileUrl\" target=\"_blank\" class=\"file-item\" data-id=\"$id\">$icon<div><div class=\"file-name\">" . eent($name) . "</div><div class=\"file-meta\">PDF - Documento</div></div></a>";
        foreach ([eent($category), $category] as $cat) {
            $esc = preg_quote($cat, '/');
            $regex = "/(<h3[^>]*>$esc<\/h3>[\s\S]*?<div [^>]*class=\"file-list-grid\"[^>]*>)/i";
            if (preg_match($regex, $content)) {
                $content = preg_replace($regex, '$1' . $newHtml, $content, 1);
                break;
            }
        }
        file_put_contents($htmlPath, $content);
        out(['success' => true]);
    }

    // DELETE
    if ($method === 'DELETE' && $id) {
        auth();
        if (!$htmlPath || !file_exists($htmlPath))
            out(['message' => 'Not found'], 404);
        $content = file_get_contents($htmlPath);
        $idEsc = preg_quote($id, '/');
        $pattern = '/<a [^>]*class="file-item"[^>]*data-id="' . $idEsc . '"[^>]*>[\s\S]*?<\/a>/i';
        if (preg_match($pattern, $content, $hit)) {
            // Delete physical file
            if (preg_match('/href="([^"]+)"/i', $hit[0], $hr)) {
                $rel = $hr[1];
                if ($rel && $rel !== '#' && strpos($rel, 'http') === false) {
                    $abs = __DIR__ . '/' . ltrim(str_replace('../../', '', $rel), '/');
                    if (file_exists($abs))
                        @unlink($abs);
                }
            }
            $content = preg_replace($pattern, '', $content, 1);
            file_put_contents($htmlPath, $content);
        }
        out(['success' => true]);
    }
}

// ══════════════════════════════════════════════════════════════
//  5. MÓDULOS HTML-DB genéricos (helper universal)
//     informe-gestion, manual-funciones, plan-monitoreo,
//     planes-talento, convocatorias, estudios-tecnicos,
//     provision-empleos, manuales-sgi, boletines,
//     politicas-sgi, cita, sirh, snif, revision-red
// ══════════════════════════════════════════════════════════════

/**
 * Módulos que usan tarjetas .pdf-folder-card con data-id
 * (o alguna clase equivalente) dentro de un HTML como BD.
 */
$HTMLDB = [
    // route               => [html,                                      upload-dir,                                                    card-class,        grid-id]
    'manual-funciones' => ['header_menu/cas/manual-funciones.html', 'data/menu header/la cas/talento humano/Manual de Funciones', 'pdf-folder-card', 'manual-funciones-grid'],
    'plan-monitoreo' => ['header_menu/cas/plan-monitoreo-sigep.html', 'data/menu header/la cas/talento humano/Plan de Monitoreo SIGEP', 'pdf-folder-card', 'plan-monitoreo-grid'],
    'planes-talento' => ['header_menu/cas/planes.html', 'data/menu header/la cas/talento humano/Planes', 'pdf-folder-card', 'planes-grid'],
    'convocatorias' => ['header_menu/cas/convocatorias.html', 'data/menu header/la cas/talento humano/Convocatorias', 'pdf-folder-card', 'convocatorias-grid'],
    'estudios-tecnicos' => ['header_menu/cas/estudios-tecnicos.html', 'data/menu header/la cas/talento humano/Estudios Tecnicos', 'pdf-folder-card', 'estudios-tecnicos-grid'],
    'provision-empleos' => ['header_menu/cas/provision-empleos.html', 'data/menu header/la cas/talento humano/Provision de empleos', 'pdf-folder-card', 'provision-empleos-grid'],
    'manuales-sgi' => ['header_menu/sgi/manuales.html', 'data/menu header/sgi/manuales', 'pdf-folder-card', 'manuales-sgi-grid'],
    'boletines' => ['header_menu/git/boletines.html', 'data/menu header/git/boletines', 'bulletin-card', 'boletines-historico-grid'],
    'politicas-sgi' => ['header_menu/sgi/politicas.html', 'data/menu header/sgi/Politicas', 'pdf-folder-card', 'politicas-grid'],
    'cita' => ['header_menu/git/manuales_usuario/cita.html', 'data/menu header/git/manuales usuario/CITA', 'pdf-folder-card', 'cita-grid'],
    'sirh' => ['header_menu/git/manuales_usuario/sirh.html', 'data/menu header/git/manuales usuario/SIRH', 'pdf-folder-card', 'sirh-grid'],
    'snif' => ['header_menu/git/manuales_usuario/snif.html', 'data/menu header/git/manuales usuario/SNIF', 'pdf-folder-card', 'snif-grid'],
    'revision-red' => ['header_menu/git/manuales_usuario/revision-red.html', 'data/menu header/git/manuales usuario/Revision Red', 'pdf-folder-card', 'revision-red-grid'],
];

foreach ($HTMLDB as $modRoute => [$htmlRel, $uploadDir, $cardClass, $gridId]) {
    $htmlPath = __DIR__ . '/' . $htmlRel;

    // --- UPLOAD for this module ---
    if ($route === "$modRoute/upload" && $method === 'POST') {
        auth();
        $field = isset($_FILES['file']) ? 'file' : 'image';
        $url = upload_file($field, $uploadDir);
        if ($url)
            out(['fileUrl' => $url, 'imageUrl' => $url]);
        out(['message' => 'Error upload'], 400);
    }

    $dirPath = __DIR__ . '/' . $uploadDir;
    $metaPath = $dirPath . '/metadata.json';
    if (!is_dir($dirPath))
        @mkdir($dirPath, 0777, true);

    // --- GET list ---
    if ($route === $modRoute && $method === 'GET') {
        $meta = file_exists($metaPath) ? read_json($metaPath) : [];
        $items = [];
        $files = is_dir($dirPath) ? scandir($dirPath) : [];
        foreach ($files as $f) {
            if ($f === '.' || $f === '..' || is_dir($dirPath . '/' . $f))
                continue;
            if (strtolower($f) === 'metadata.json')
                continue;
            $m = $meta[$f] ?? [];

            // Codificar cada segmento de la ruta para evitar errores con espacios o acentos en URLs
            $dirSegments = explode('/', ltrim($uploadDir, '/'));
            $encodedDir = implode('/', array_map('rawurlencode', $dirSegments));
            $encodedFile = rawurlencode($f);
            $relativeUrl = WEB_BASE_PATH . ltrim($encodedDir, '/') . '/' . $encodedFile;

            $items[] = array_merge($m, [
                'id' => md5($f),
                'filename' => $f,
                'name' => $m['name'] ?? $m['title'] ?? pathinfo($f, PATHINFO_FILENAME),
                'title' => $m['title'] ?? $m['name'] ?? pathinfo($f, PATHINFO_FILENAME),
                'href' => $relativeUrl,
                'fileUrl' => $relativeUrl,
                'imageUrl' => $relativeUrl,
                'category' => $m['category'] ?? ''
            ]);
        }
        usort($items, fn($a, $b) => strcmp($b['filename'], $a['filename']));
        out($items);
    }

    // --- POST create ---
    if ($route === $modRoute && $method === 'POST') {
        auth();
        $in = body();
        if (empty($in))
            out(['error' => 'Empty request body: ' . file_get_contents('php://input')], 400);

        $fUrl = $in['fileUrl'] ?? $in['imageUrl'] ?? $in['href'] ?? '';
        if (!$fUrl)
            out(['error' => 'No file URL provided. Payload received: ' . json_encode($in)], 400);

        $f = basename(urldecode($fUrl));
        if ($f) {
            $meta = file_exists($metaPath) ? read_json($metaPath) : [];
            $currentMeta = $meta[$f] ?? [];
            unset($in['id'], $in['fileUrl'], $in['imageUrl'], $in['href']); // Remove redundant properties from metadata
            $meta[$f] = array_merge($currentMeta, $in, [
                'name' => $in['name'] ?? $in['title'] ?? pathinfo($f, PATHINFO_FILENAME),
                'category' => $in['category'] ?? ''
            ]);
            write_json($metaPath, $meta);
            out(['id' => md5($f)], 201);
        }
        out(['error' => 'Invalid filename format extracted from: ' . $fUrl], 400);
    }

    // --- PUT update ---
    if (preg_match('/^' . preg_quote($modRoute, '/') . '\/([a-zA-Z0-9_\-]+)$/', $route, $m2) && $method === 'PUT') {
        auth();
        $id = $m2[1];
        $in = body();
        $meta = file_exists($metaPath) ? read_json($metaPath) : [];
        $found = false;

        // Buscamos el archivo físico asociado a este ID
        foreach (scandir($dirPath) as $f) {
            if (md5($f) === $id) {
                $currentMeta = $meta[$f] ?? [];
                unset($in['id'], $in['fileUrl'], $in['imageUrl'], $in['href']);
                $meta[$f] = array_merge($currentMeta, $in, [
                    'name' => $in['name'] ?? $in['title'] ?? pathinfo($f, PATHINFO_FILENAME),
                    'category' => $in['category'] ?? ''
                ]);
                write_json($metaPath, $meta);
                $found = true;
                break;
            }
        }
        if ($found)
            out(['success' => true]);
        out(['error' => 'File not found'], 404);
    }

    // --- DELETE ---
    if (preg_match('/^' . preg_quote($modRoute, '/') . '\/([a-zA-Z0-9_\-]+)$/', $route, $m2) && $method === 'DELETE') {
        auth();
        $id = $m2[1];
        $meta = file_exists($metaPath) ? read_json($metaPath) : [];
        foreach (scandir($dirPath) as $f) {
            if (md5($f) === $id) {
                @unlink($dirPath . '/' . $f);
                unset($meta[$f]);
                write_json($metaPath, $meta);
                break;
            }
        }
        out(['success' => true]);
    }
}

// ══════════════════════════════════════════════════════════════
//  6. INFORME DE GESTIÓN (tarjetas info-card)
// ══════════════════════════════════════════════════════════════


if (strpos($route, 'informe-gestion') === 0) {
    $uploadDir = 'data/menu header/la cas/Informe de Gestion';
    $dirPath = __DIR__ . '/' . $uploadDir;
    $metaPath = $dirPath . '/metadata.json';
    if (!is_dir($dirPath))
        @mkdir($dirPath, 0777, true);

    if ($route === 'informe-gestion/upload' && $method === 'POST') {
        auth();
        $url = upload_file('file', $uploadDir);
        if ($url)
            out(['fileUrl' => $url, 'filename' => basename($url)]);
        out(['message' => 'Error'], 400);
    }

    if ($route === 'informe-gestion' && $method === 'GET') {
        $meta = file_exists($metaPath) ? read_json($metaPath) : [];
        $items = [];
        $files = is_dir($dirPath) ? scandir($dirPath) : [];
        foreach ($files as $f) {
            if ($f === '.' || $f === '..' || strtolower(pathinfo($f, PATHINFO_EXTENSION)) !== 'pdf')
                continue;
            $m = $meta[$f] ?? [];
            $dirSegments = explode('/', ltrim($uploadDir, '/'));
            $encodedDir = implode('/', array_map('rawurlencode', $dirSegments));
            $items[] = [
                'id' => md5($f),
                'filename' => $f,
                'title' => $m['title'] ?? pathinfo($f, PATHINFO_FILENAME),
                'description' => $m['description'] ?? 'Documento Institucional disponible.',
                'pdfUrl' => WEB_BASE_PATH . ltrim($encodedDir, '/') . '/' . rawurlencode($f)
            ];
        }
        // Orden descendente por defecto
        usort($items, fn($a, $b) => strcmp($b['filename'], $a['filename']));
        out($items);
    }

    if ($route === 'informe-gestion' && $method === 'POST') {
        auth();
        $in = body();
        $f = basename($in['pdfUrl'] ?? ''); // extraemos nombre original de fileUrl/pdfUrl
        if (!$f)
            $f = $in['filename'] ?? '';

        if ($f) {
            $meta = file_exists($metaPath) ? read_json($metaPath) : [];
            $meta[$f] = [
                'title' => $in['title'] ?? pathinfo($f, PATHINFO_FILENAME),
                'description' => $in['description'] ?? ''
            ];
            write_json($metaPath, $meta);
            out(['success' => true, 'id' => md5($f)], 201);
        }
        out(['error' => 'No filename provided'], 400);
    }

    if (preg_match('/^informe-gestion\/([a-zA-Z0-9_\-]+)$/', $route, $matchId)) {
        auth();
        $id = $matchId[1];
        if ($method === 'DELETE') {
            $meta = file_exists($metaPath) ? read_json($metaPath) : [];
            foreach (scandir($dirPath) as $f) {
                if (md5($f) === $id) {
                    @unlink($dirPath . '/' . $f);
                    unset($meta[$f]);
                    write_json($metaPath, $meta);
                    out(['success' => true]);
                }
            }
            out(['success' => true]); // even if not found
        }
    }
}

// ══════════════════════════════════════════════════════════════
//  7. RESPEL  (JSON per-section CRUD: documentos, obligaciones, gestores, empresas)
//  Routes: GET/POST /api/respel/{section}
//          PUT/DELETE /api/respel/{section}/{id}
//          POST /api/respel/upload
// ══════════════════════════════════════════════════════════════

$RESPEL_SECTIONS = ['documentos', 'obligaciones', 'gestores', 'empresas'];

// Upload
if ($route === 'respel/upload' && $method === 'POST') {
    auth();
    $sec = $_POST['section'] ?? 'documentos';
    $url = upload_file('file', 'data/Herramientas/RESPEL/' . $sec);
    if ($url)
        out(['fileUrl' => $url]);
    out(['message' => 'Error upload'], 400);
}

// GET /api/respel/{section}
if (preg_match('/^respel\/(' . implode('|', $RESPEL_SECTIONS) . ')$/', $route, $rm) && $method === 'GET') {
    $sec = $rm[1];
    $path = __DIR__ . '/data/Herramientas/RESPEL/' . $sec . '.json';
    if (!is_dir(dirname($path)))
        mkdir(dirname($path), 0777, true);
    out(read_json($path));
}

// POST /api/respel/{section}
if (preg_match('/^respel\/(' . implode('|', $RESPEL_SECTIONS) . ')$/', $route, $rm) && $method === 'POST') {
    auth();
    $sec = $rm[1];
    $path = __DIR__ . '/data/Herramientas/RESPEL/' . $sec . '.json';
    if (!is_dir(dirname($path)))
        mkdir(dirname($path), 0777, true);
    $in = body();
    $data = read_json($path);
    $in['id'] = uniqid();
    $in['createdAt'] = date('c');
    array_unshift($data, $in);
    write_json($path, $data);
    out(['message' => 'Creado', 'id' => $in['id']], 201);
}

// PUT/DELETE /api/respel/{section}/{id}
if (preg_match('/^respel\/(' . implode('|', $RESPEL_SECTIONS) . ')\/([a-zA-Z0-9_\-]+)$/', $route, $rm)) {
    auth();
    $sec = $rm[1];
    $id = $rm[2];
    $path = __DIR__ . '/data/Herramientas/RESPEL/' . $sec . '.json';
    $data = read_json($path);

    if ($method === 'DELETE') {
        // Also delete physical file if exists
        foreach ($data as $item) {
            if (($item['id'] ?? '') === $id && !empty($item['fileUrl'])) {
                $abs = __DIR__ . '/' . ltrim($item['fileUrl'], '/');
                if (file_exists($abs))
                    @unlink($abs);
            }
        }
        $data = array_values(array_filter($data, fn($i) => ($i['id'] ?? '') !== $id));
        write_json($path, $data);
        out(['success' => true]);
    }

    if ($method === 'PUT') {
        $in = body();
        foreach ($data as &$item) {
            if (($item['id'] ?? '') === $id) {
                $item = array_merge($item, $in);
                break;
            }
        }
        write_json($path, $data);
        out(['success' => true]);
    }
}

// ══════════════════════════════════════════════════════════════
//  8. RUA  (json file-based)
// ══════════════════════════════════════════════════════════════

if (strpos($route, 'rua') === 0) {
    $jsonPath = __DIR__ . '/data/Herramientas/Rua/rua.json';
    if (!is_dir(dirname($jsonPath)))
        mkdir(dirname($jsonPath), 0777, true);

    if ($route === 'rua' && $method === 'GET')
        out(read_json($jsonPath));

    if ($route === 'rua' && $method === 'POST') {
        auth();
        $in = body();
        $data = read_json($jsonPath);
        $in['id'] = uniqid();
        $in['createdAt'] = date('c');
        array_unshift($data, $in);
        write_json($jsonPath, $data);
        out(['id' => $in['id']], 201);
    }

    if ($route === 'rua/upload' && $method === 'POST') {
        auth();
        $url = upload_file('file', 'data/Herramientas/Rua');
        if ($url)
            out(['fileUrl' => $url]);
        out(['message' => 'Error'], 400);
    }

    if (preg_match('/^rua\/([a-zA-Z0-9_\-]+)$/', $route, $m) && $method === 'DELETE') {
        auth();
        $data = read_json($jsonPath);
        $data = array_values(array_filter($data, fn($i) => ($i['id'] ?? '') !== $m[1]));
        write_json($jsonPath, $data);
        out(['success' => true]);
    }

    if (preg_match('/^rua\/([a-zA-Z0-9_\-]+)$/', $route, $m) && $method === 'PUT') {
        auth();
        $in = body();
        $data = read_json($jsonPath);
        foreach ($data as &$item) {
            if (($item['id'] ?? '') === $m[1]) {
                $item = array_merge($item, $in);
                break;
            }
        }
        write_json($jsonPath, $data);
        out(['success' => true]);
    }
}

// ══════════════════════════════════════════════════════════════
//  9. PCB (html-db con pcb-card + tabla json)
// ══════════════════════════════════════════════════════════════

if (strpos($route, 'pcb') === 0) {
    $htmlPath = __DIR__ . '/herramientas/pcb.html';
    $tablaPath = __DIR__ . '/data/Herramientas/pcb-tabla.json';
    if (!is_dir(dirname($tablaPath)))
        mkdir(dirname($tablaPath), 0777, true);

    if ($route === 'pcb' && $method === 'GET') {
        if (!file_exists($htmlPath))
            out([]);
        $content = file_get_contents($htmlPath);
        preg_match_all('/<a [^>]*class="(?:file-item|pdf-folder-card)"[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i', $content, $all, PREG_SET_ORDER);
        $items = [];
        foreach ($all as $hit) {
            preg_match('/href="([^"]*)"/i', $hit[0], $hr);
            preg_match('/<div class="file-name">([\s\S]*?)<\/div>/i', $hit[2], $nm);
            preg_match('/<h4>([\s\S]*?)<\/h4>/i', $hit[2], $nm4);
            $name = dent(strip_tags($nm[1] ?? $nm4[1] ?? ''));
            $items[] = ['id' => $hit[1], 'title' => trim($name), 'href' => $hr[1] ?? '#'];
        }
        out($items);
    }

    if ($route === 'pcb' && $method === 'POST') {
        auth();
        $in = body();
        $id = 'pcb_' . time();
        $url = $in['fileUrl'] ?? '#';
        $name = eent($in['title'] ?? 'Documento PCB');
        $icon = '<div class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div>';
        $card = "\n<a href=\"$url\" target=\"_blank\" class=\"file-item\" data-id=\"$id\">$icon<div><div class=\"file-name\">$name</div><div class=\"file-meta\">PDF</div></div></a>";
        $content = file_get_contents($htmlPath);
        // Insert into file-list-grid
        $content = preg_replace('/(<div[^>]*class="file-list-grid"[^>]*>)/i', '$1' . $card, $content, 1);
        file_put_contents($htmlPath, $content);
        out(['id' => $id], 201);
    }

    if ($route === 'pcb/upload' && $method === 'POST') {
        auth();
        $url = upload_file('file', 'data/Herramientas/PCB');
        if ($url)
            out(['fileUrl' => $url]);
        out(['message' => 'Error'], 400);
    }

    if (preg_match('/^pcb\/([a-zA-Z0-9_\-]+)$/', $route, $m) && $method === 'DELETE') {
        auth();
        $id = $m[1];
        $content = file_get_contents($htmlPath);
        $idEsc = preg_quote($id, '/');
        // Regex adjusted to catch both class structures
        $pat = '/<a [^>]*class="(?:file-item|pdf-folder-card)"[^>]*data-id="' . $idEsc . '"[^>]*>[\s\S]*?<\/a>/i';
        if (preg_match($pat, $content, $hit)) {
            // Delete physical file
            if (preg_match('/href="([^"]+)"/i', $hit[0], $hr)) {
                $f = $hr[1];
                // Resolve relative path to absolute disk path
                if (strpos($f, '../') === 0)
                    $f = substr($f, 3);
                $full = __DIR__ . '/' . ltrim($f, '/');
                if (file_exists($full) && is_file($full))
                    @unlink($full);
            }
            $content = preg_replace($pat, '', $content, 1);
            file_put_contents($htmlPath, $content);
        }
        out(['success' => true]);
    }

    // PCB Tabla (json CRUD)
    $syncPcbTable = function () use ($tablaPath, $htmlPath) {
        $data = read_json($tablaPath);
        $htmlRows = "";
        foreach ($data as $i => $r) {
            $bg = ($i % 2 === 0) ? "#fff" : "#f1f8ff";
            $htmlRows .= "\n                <tr data-id=\"{$r['id']}\" style=\"background: $bg\">
                  <td style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e0e0e0;\">{$r['tipoProp']}</td>
                  <td style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e0e0e0; text-align: center;\">{$r['plazoInsc']}</td>
                  <td style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e0e0e0; text-align: center;\">{$r['periodoBalance']}</td>
                  <td style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e0e0e0; text-align: center;\">{$r['fechaLimite']}</td>
                  <td style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e0e0e0; text-align: center;\">{$r['actualizacion']}</td>
                </tr>";
        }
        $content = file_get_contents($htmlPath);
        $content = preg_replace('/<tbody>[\s\S]*?<!-- END_PCB_TABLE -->/i', "<tbody>" . $htmlRows . "\n\n                <!-- END_PCB_TABLE -->", $content, 1);
        file_put_contents($htmlPath, $content);
    };

    if ($route === 'pcb/tabla' && $method === 'GET')
        out(read_json($tablaPath));
    if ($route === 'pcb/tabla' && $method === 'POST') {
        auth();
        $in = body();
        $in['id'] = uniqid();
        $data = read_json($tablaPath);
        $data[] = $in;
        write_json($tablaPath, $data);
        $syncPcbTable();
        out(['id' => $in['id']], 201);
    }
    if (preg_match('/^pcb\/tabla\/([a-zA-Z0-9_\-]+)$/', $route, $m)) {
        auth();
        $id = $m[1];
        $data = read_json($tablaPath);
        if ($method === 'DELETE') {
            $data = array_values(array_filter($data, fn($i) => $i['id'] !== $id));
            write_json($tablaPath, $data);
            $syncPcbTable();
            out(['success' => true]);
        }
        if ($method === 'PUT') {
            $in = body();
            foreach ($data as &$r) {
                if ($r['id'] === $id) {
                    $r = array_merge($r, $in);
                    break;
                }
            }
            write_json($tablaPath, $data);
            $syncPcbTable();
            out(['success' => true]);
        }
    }
}

// ══════════════════════════════════════════════════════════════
//  10. SEARCH GLOBAL (Universal Crawler en PHP)
// ══════════════════════════════════════════════════════════════

if ($route === 'search' && $method === 'GET') {
    $q = strtolower(trim($_GET['q'] ?? ''));
    $cat = strtolower(trim($_GET['category'] ?? 'all'));
    $sDate = empty($_GET['startDate']) ? null : strtotime($_GET['startDate']);
    $eDate = empty($_GET['endDate']) ? null : strtotime($_GET['endDate']);

    $results = [];
    $seen = [];
    $docExts = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];

    // Filter by date helper
    $isValidDate = function ($dateStr) use ($sDate, $eDate) {
        if (!$sDate && !$eDate)
            return true;
        if (!$dateStr)
            return false;
        $ts = strtotime($dateStr);
        if (!$ts)
            return true; // si no tiene fecha parseable, preferimos mostrarlo
        if ($sDate && $ts < $sDate)
            return false;
        if ($eDate && $ts > $eDate + 86400)
            return false; // up to end of selected day
        return true;
    };

    // Filter by text helper
    $matchText = function ($text) use ($q) {
        if ($q === '')
            return true;
        return strpos(strtolower($text), $q) !== false;
    };

    // A) Noticias
    if ($cat === 'all' || strpos($cat, 'noticia') !== false) {
        foreach (read_json(__DIR__ . '/data/noticias.json') as $n) {
            if ($matchText($n['title'] . ' ' . $n['description']) && $isValidDate($n['createdAt'] ?? '')) {
                $results[] = [
                    'type' => 'Noticia',
                    'title' => $n['title'],
                    'href' => WEB_BASE_PATH . 'header_menu/cas/noticas-cas.html',
                    'snippet' => $n['description'],
                    'date' => $n['createdAt'] ?? '',
                ];
            }
        }
    }

    // B) file-item links in all HTML files
    $htmlDirs = ['header_menu/cas', 'header_menu/sgi', 'header_menu/git', 'herramientas'];
    foreach ($htmlDirs as $d) {
        $files = glob(__DIR__ . '/' . $d . '/*.html') ?: [];
        foreach ($files as $f) {
            $content = file_get_contents($f);
            // Search for all links that look like actual files or documents
            preg_match_all('/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i', $content, $all, PREG_SET_ORDER);
            foreach ($all as $hit) {
                $href = $hit[1];
                if (!$href || $href === '#' || isset($seen[$href]))
                    continue;

                // Only index files with known extensions or specific classes
                $ext = strtolower(pathinfo($href, PATHINFO_EXTENSION));
                $isDoc = in_array($ext, $docExts);
                $isExplicit = preg_match('/class="[^"]*(?:file-item|pdf-folder-card|btn-pdf-download)[^"]*"/i', $hit[0]);

                if (!$isDoc && !$isExplicit)
                    continue;

                // Try to find a name: either inside the <a> or in a nearby <h4>/<div> if the link is a button
                $linkText = trim(strip_tags($hit[2]));
                $name = "";

                if (strlen($linkText) > 3) {
                    $name = $linkText;
                } else {
                    // If link text is short (like "Ver PDF"), look at the context in the parent <div>
                    // This is a bit complex for regex, so we'll just use the filename if nothing else
                    $name = basename($href);
                }

                $name = trim(dent($name));

                // Determine implicit category from folder
                $fileCat = 'Documento';
                if (strpos($f, 'sgi') !== false)
                    $fileCat = 'SGI';
                if (strpos($f, 'git') !== false)
                    $fileCat = 'GIT';
                if (strpos($f, 'herramientas') !== false)
                    $fileCat = 'Herramienta';

                if (
                    ($cat === 'all' || strtolower($fileCat) === $cat || strpos(strtolower($fileCat), $cat) !== false) &&
                    ($matchText($name) || $matchText($href))
                ) {

                    if (strpos($href, '../../') === 0)
                        $href = WEB_BASE_PATH . substr($href, 6);
                    else if (strpos($href, 'http') !== 0 && strpos($href, '/') !== 0)
                        $href = WEB_BASE_PATH . $d . '/' . $href;

                    $results[] = [
                        'type' => $fileCat,
                        'title' => $name,
                        'href' => $href,
                        'snippet' => 'Encontrado en ' . basename($f),
                        'date' => date('Y-m-d', filemtime($f))
                    ];
                    $seen[$href] = true;
                }
            }
        }
    }

    // C) Physical files in data/
    $dataDirs = ['data/menu header', 'data/Talento humano', 'data/Herramientas'];

    // Convert logic to use recursive function correctly without pass-by-ref errors in older PHP
    $scanDocs = null;
    $scanDocs = function ($dir, $root) use (&$scanDocs, $docExts, $q, $cat, $isValidDate, $matchText, &$results, &$seen) {
        if (!is_dir($dir))
            return;
        foreach (scandir($dir) as $f) {
            if ($f === '.' || $f === '..')
                continue;
            $full = $dir . '/' . $f;
            if (is_dir($full)) {
                $scanDocs($full, $root);
                continue;
            }
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (!in_array($ext, $docExts))
                continue;

            $fileCat = strtoupper($ext);
            $modTime = filemtime($full);

            if (
                ($cat === 'all' || strtolower($fileCat) === $cat) &&
                ($matchText($f)) &&
                ($isValidDate(date('Y-m-d', $modTime)))
            ) {

                $rel = WEB_BASE_PATH . ltrim(str_replace('\\', '/', substr($full, strlen($root))), '/');
                if (!isset($seen[$rel])) {
                    $results[] = [
                        'type' => $fileCat,
                        'title' => pathinfo($f, PATHINFO_FILENAME),
                        'href' => $rel,
                        'snippet' => 'Archivo físico en ' . basename(dirname($full)),
                        'date' => date('Y-m-d', $modTime)
                    ];
                    $seen[$rel] = true;
                }
            }
        }
    };

    foreach ($dataDirs as $d) {
        $scanDocs(__DIR__ . '/' . $d, __DIR__);
    }

    out(array_slice($results, 0, 50));
}

// ══════════════════════════════════════════════════════════════
//  11. USERS (gerencia de usuarios - solo superadmin)
// ══════════════════════════════════════════════════════════════

// Already handled by JSON_MAP above; this block handles superadmin-only password update
if (preg_match('/^users\/([a-zA-Z0-9_\-]+)$/', $route, $m) && $method === 'PUT') {
    auth(true);
    $id = $m[1];
    $in = body();
    $path = __DIR__ . '/default_user.json';
    $data = read_json($path);
    foreach ($data as &$u) {
        $uid = $u['_id']['$oid'] ?? $u['id'] ?? '';
        if ($uid === $id) {
            if (!empty($in['password']))
                $in['password'] = password_hash($in['password'], PASSWORD_BCRYPT);
            $u = array_merge($u, $in);
            break;
        }
    }
    write_json($path, $data);
    out(['success' => true]);
}

// ══════════════════════════════════════════════════════════════
//  12. MISC
// ══════════════════════════════════════════════════════════════

if ($route === 'test-server')
    out(['status' => 'ok', 'engine' => 'PHP', 'time' => date('c')]);

// 404
out(['error' => 'Route not found', 'route' => $route], 404);
