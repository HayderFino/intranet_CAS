<?php
/**
 * Misc Modules (Informe de Gestion, Test Server, etc)
 */

route('GET', 'test-server', function() {
    out(['status' => 'ok', 'engine' => 'PHP', 'time' => date('c')]);
});

// Informe de Gestión
$igUploadDir = 'data/menu header/la cas/Informe de Gestion';
$igAbsPath = DATA_ROOT . $igUploadDir;

route('POST', 'informe-gestion/upload', function() use ($igUploadDir) {
    auth();
    $url = upload_file('file', $igUploadDir);
    if ($url) out(['fileUrl' => $url, 'filename' => basename($url)]);
    out(['message' => 'Error'], 400);
});

route('GET', 'informe-gestion', function() use ($igAbsPath, $igUploadDir) {
    $metaPath = $igAbsPath . '/metadata.json';
    $meta = read_json($metaPath);
    $items = [];
    $files = is_dir($igAbsPath) ? scandir($igAbsPath) : [];
    foreach ($files as $f) {
        if ($f === '.' || $f === '..' || strtolower(pathinfo($f, PATHINFO_EXTENSION)) !== 'pdf') continue;
        $m = $meta[$f] ?? [];
        $dirSegments = explode('/', ltrim($igUploadDir, '/'));
        $encodedDir = implode('/', array_map('rawurlencode', $dirSegments));
        $items[] = [
            'id' => md5($f),
            'filename' => $f,
            'title' => $m['title'] ?? pathinfo($f, PATHINFO_FILENAME),
            'description' => $m['description'] ?? 'Documento Institucional disponible.',
            'pdfUrl' => WEB_BASE_PATH . ltrim($encodedDir, '/') . '/' . rawurlencode($f)
        ];
    }
    usort($items, fn($a, $b) => strcmp($b['filename'], $a['filename']));
    out($items);
});

route('POST', 'informe-gestion', function() use ($igAbsPath) {
    auth();
    $in = body();
    $f = basename($in['pdfUrl'] ?? '');
    if (!$f) $f = $in['filename'] ?? '';
    if ($f) {
        $metaPath = $igAbsPath . '/metadata.json';
        $meta = read_json($metaPath);
        $meta[$f] = ['title' => $in['title'] ?? pathinfo($f, PATHINFO_FILENAME), 'description' => $in['description'] ?? ''];
        write_json($metaPath, $meta);
        out(['success' => true, 'id' => md5($f)], 201);
    }
    out(['error' => 'No filename provided'], 400);
});

route('DELETE', 'informe-gestion/:id', function($id) use ($igAbsPath) {
    auth();
    $metaPath = $igAbsPath . '/metadata.json';
    $meta = read_json($metaPath);
    foreach (scandir($igAbsPath) as $f) {
        if (md5($f) === $id) {
            @unlink($igAbsPath . '/' . $f);
            unset($meta[$f]);
            write_json($metaPath, $meta);
            break;
        }
    }
    out(['success' => true]);
});
