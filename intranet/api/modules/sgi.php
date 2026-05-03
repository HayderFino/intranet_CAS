<?php
/**
 * SGI & HTML-DB Module
 */

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

// SGI Section Handler
route('GET', 'sgi/:section', function($section) use ($SGI_HTML) {
    $htmlRel = $SGI_HTML[$section] ?? null;
    $htmlPath = $htmlRel ? DATA_ROOT . $htmlRel : null;

    if (!$htmlPath || !file_exists($htmlPath)) out([]);
    
    $content = file_get_contents($htmlPath);
    $cats = [];
    preg_match_all('/<h3[^>]*>(.*?)<\/h3>/is', $content, $catM, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);
    foreach ($catM as $c) $cats[] = ['pos' => $c[0][1], 'name' => dent(strip_tags($c[1][0]))];

    $items = [];
    $pattern = '/<a [^>]*class="file-item"[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i';
    preg_match_all($pattern, $content, $all, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);
    foreach ($all as $hit) {
        $outer = $hit[0][0];
        $pos = $hit[0][1];
        $iid = $hit[1][0];
        preg_match('/href="([^"]*)"/i', $outer, $hr);
        preg_match('/<div class="file-name">([\s\S]*?)<\/div>/i', $hit[2][0], $nm);

        $cat = '';
        foreach ($cats as $c) { if ($c['pos'] < $pos) $cat = $c['name']; }

        $items[] = [
            'id' => $iid,
            'name' => trim(dent(strip_tags($nm[1] ?? 'Sin nombre'))),
            'href' => $hr[1] ?? '#',
            'fileUrl' => $hr[1] ?? '#',
            'category' => $cat,
        ];
    }
    out($items);
});

route('POST', 'sgi/:section', function($section) use ($SGI_HTML) {
    auth();
    $htmlRel = $SGI_HTML[$section] ?? null;
    $htmlPath = $htmlRel ? DATA_ROOT . $htmlRel : null;
    if (!$htmlPath || !file_exists($htmlPath)) out(['message' => 'Section not found'], 404);

    $in = body();
    $newId = $in['id'] ?? time();
    $fileUrl = $in['fileUrl'] ?? '#';
    $name = $in['name'] ?? 'Sin nombre';
    $category = $in['category'] ?? '';

    $icon = '<div class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>';
    $newHtml = "\n<a href=\"$fileUrl\" target=\"_blank\" class=\"file-item\" data-id=\"$newId\">$icon<div><div class=\"file-name\">" . eent($name) . "</div><div class=\"file-meta\">PDF - Documento</div></div></a>";

    $content = file_get_contents($htmlPath);
    $inserted = false;
    foreach ([eent($category), $category] as $cat) {
        $esc = preg_quote($cat, '/');
        $regex = "/(<h3[^>]*>$esc<\/h3>[\s\S]*?<div [^>]*class=\"file-list-grid\"[^>]*>)/i";
        if (preg_match($regex, $content)) {
            $content = preg_replace($regex, '$1' . $newHtml, $content, 1);
            $inserted = true;
            break;
        }
    }
    if (!$inserted) out(['message' => 'Categoría no encontrada en HTML'], 404);
    file_put_contents($htmlPath, $content);
    out(['id' => $newId], 201);
});

route('PUT', 'sgi/:section/:id', function($section, $id) use ($SGI_HTML) {
    auth();
    $htmlRel = $SGI_HTML[$section] ?? null;
    $htmlPath = $htmlRel ? DATA_ROOT . $htmlRel : null;
    if (!$htmlPath || !file_exists($htmlPath)) out(['message' => 'Section not found'], 404);
    
    $in = body();
    $content = file_get_contents($htmlPath);
    $idEsc = preg_quote($id, '/');
    $delPat = '/<a [^>]*class="file-item"[^>]*data-id="' . $idEsc . '"[^>]*>[\s\S]*?<\/a>/i';
    $content = preg_replace($delPat, '', $content, 1);

    $name = $in['name'] ?? 'Sin nombre';
    $fileUrl = $in['fileUrl'] ?? '#';
    $category = $in['category'] ?? '';
    $icon = '<div class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>';
    $newHtml = "\n<a href=\"$fileUrl\" target=\"_blank\" class=\"file-item\" data-id=\"$id\">$icon<div><div class=\"file-name\">" . eent($name) . "</div><div class=\"file-meta\">PDF - Documento</div></div></a>";
    
    $inserted = false;
    foreach ([eent($category), $category] as $cat) {
        $esc = preg_quote($cat, '/');
        $regex = "/(<h3[^>]*>$esc<\/h3>[\s\S]*?<div [^>]*class=\"file-list-grid\"[^>]*>)/i";
        if (preg_match($regex, $content)) {
            $content = preg_replace($regex, '$1' . $newHtml, $content, 1);
            $inserted = true;
            break;
        }
    }
    file_put_contents($htmlPath, $content);
    out(['success' => true]);
});

route('DELETE', 'sgi/:section/:id', function($section, $id) use ($SGI_HTML) {
    auth();
    $htmlRel = $SGI_HTML[$section] ?? null;
    $htmlPath = $htmlRel ? DATA_ROOT . $htmlRel : null;
    if (!$htmlPath || !file_exists($htmlPath)) out(['message' => 'Not found'], 404);
    
    $content = file_get_contents($htmlPath);
    $idEsc = preg_quote($id, '/');
    $pattern = '/<a [^>]*class="file-item"[^>]*data-id="' . $idEsc . '"[^>]*>[\s\S]*?<\/a>/i';
    if (preg_match($pattern, $content, $hit)) {
        if (preg_match('/href="([^"]+)"/i', $hit[0], $hr)) {
            $rel = $hr[1];
            if ($rel && $rel !== '#' && strpos($rel, 'http') === false) {
                $abs = DATA_ROOT . ltrim(str_replace('../../', '', $rel), '/');
                if (file_exists($abs)) @unlink($abs);
            }
        }
        $content = preg_replace($pattern, '', $content, 1);
        file_put_contents($htmlPath, $content);
    }
    out(['success' => true]);
});

// Generic HTML-DB Handler
$HTMLDB = [
    'manual-funciones' => ['header_menu/cas/manual-funciones.html', 'data/menu header/la cas/talento humano/Manual de Funciones'],
    'plan-monitoreo' => ['header_menu/cas/plan-monitoreo-sigep.html', 'data/menu header/la cas/talento humano/Plan de Monitoreo SIGEP'],
    'planes-talento' => ['header_menu/cas/planes.html', 'data/menu header/la cas/talento humano/Planes'],
    'convocatorias' => ['header_menu/cas/convocatorias.html', 'data/menu header/la cas/talento humano/Convocatorias'],
    'estudios-tecnicos' => ['header_menu/cas/estudios-tecnicos.html', 'data/menu header/la cas/talento humano/Estudios Tecnicos'],
    'provision-empleos' => ['header_menu/cas/provision-empleos.html', 'data/menu header/la cas/talento humano/Provision de empleos'],
    'manuales-sgi' => ['header_menu/sgi/manuales.html', 'data/menu header/sgi/manuales'],
    'boletines' => ['header_menu/git/boletines.html', 'data/menu header/git/boletines'],
    'politicas-sgi' => ['header_menu/sgi/politicas.html', 'data/menu header/sgi/Politicas'],
    'cita' => ['header_menu/git/manuales_usuario/cita.html', 'data/menu header/git/manuales usuario/CITA'],
    'sirh' => ['header_menu/git/manuales_usuario/sirh.html', 'data/menu header/git/manuales usuario/SIRH'],
    'snif' => ['header_menu/git/manuales_usuario/snif.html', 'data/menu header/git/manuales usuario/SNIF'],
    'revision-red' => ['header_menu/git/manuales_usuario/revision-red.html', 'data/menu header/git/manuales usuario/Revision Red'],
    'sgi-gestion-documental' => ['header_menu/sgi/gestion-documental.html', 'data/menu header/sgi/Procesos de Apoyo/Gestión Documental'],
    'sgi-contratacion' => ['header_menu/sgi/contratacion.html', 'data/menu header/sgi/Procesos de Apoyo/Contratación'],
    'sgi-juridico' => ['header_menu/sgi/juridico.html', 'data/menu header/sgi/Procesos de Apoyo/Jurídico'],
    'sgi-bienes-servicios' => ['header_menu/sgi/bienes-servicios.html', 'data/menu header/sgi/Procesos de Apoyo/Bienes y Servicios'],
    'sgi-gestion-tecnologias' => ['header_menu/sgi/gestion-tecnologias.html', 'data/menu header/sgi/Procesos de Apoyo/Gestión de la Información y Tecnologías'],
    'sgi-talento-humano' => ['header_menu/sgi/talento-humano.html', 'data/menu header/sgi/Procesos de Apoyo/Talento Humano'],
    'sgi-control-disciplinario' => ['header_menu/sgi/control-disciplinario.html', 'data/menu header/sgi/Procesos de Apoyo/Control Interno Disciplinario'],
    'sgi-cobro-coactivo' => ['header_menu/sgi/cobro-coactivo.html', 'data/menu header/sgi/Procesos de Apoyo/Cobro Coactivo'],
    'sgi-gestion-financiera' => ['header_menu/sgi/gestion-financiera.html', 'data/menu header/sgi/Procesos de Apoyo/Gestión Financiera'],
    'sgi-gestion-integral' => ['header_menu/sgi/gestion-integral.html', 'data/menu header/sgi/Procesos de Apoyo/Gestión Integral'],
];

foreach ($HTMLDB as $modRoute => [$htmlRel, $uploadDir]) {
    
    // UPLOAD
    route('POST', "$modRoute/upload", function() use ($uploadDir) {
        auth();
        $field = isset($_FILES['file']) ? 'file' : 'image';
        $targetDir = $uploadDir;
        if (!empty($_POST['category'])) $targetDir = rtrim($uploadDir, '/') . '/' . $_POST['category'];
        $url = upload_file($field, $targetDir);
        if ($url) out(['fileUrl' => $url, 'imageUrl' => $url]);
        out(['message' => 'Error upload'], 400);
    });

    // LIST
    route('GET', $modRoute, function() use ($uploadDir) {
        $dirPath = DATA_ROOT . $uploadDir;
        $metaPath = $dirPath . '/metadata.json';
        $meta = file_exists($metaPath) ? read_json($metaPath) : [];
        $items = [];
        $allFiles = [];
        if (is_dir($dirPath)) {
            foreach (scandir($dirPath) as $f) {
                if ($f === '.' || $f === '..' || strtolower($f) === 'metadata.json') continue;
                if (is_dir($dirPath . '/' . $f)) {
                    foreach (scandir($dirPath . '/' . $f) as $sf) {
                        if ($sf === '.' || $sf === '..') continue;
                        $allFiles[] = $f . '/' . $sf;
                    }
                } else $allFiles[] = $f;
            }
        }
        foreach ($allFiles as $f) {
            $base = basename($f);
            $m = $meta[$f] ?? $meta[$base] ?? [];
            $dirSegments = explode('/', ltrim($uploadDir, '/'));
            $encodedDir = implode('/', array_map('rawurlencode', $dirSegments));
            $fSegments = explode('/', $f);
            $encodedFile = implode('/', array_map('rawurlencode', $fSegments));
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
    });

    // CREATE
    route('POST', $modRoute, function() use ($uploadDir) {
        auth();
        $in = !empty($_POST) ? $_POST : body();
        if (isset($_FILES['file']) || isset($_FILES['image'])) {
            $field = isset($_FILES['file']) ? 'file' : 'image';
            $targetDir = $uploadDir;
            if (!empty($in['category'])) $targetDir = rtrim($uploadDir, '/') . '/' . $in['category'];
            $uploadedUrl = upload_file($field, $targetDir);
            if ($uploadedUrl) { $in['fileUrl'] = $uploadedUrl; $in['imageUrl'] = $uploadedUrl; $in['href'] = $uploadedUrl; }
        }
        $fUrl = $in['fileUrl'] ?? $in['imageUrl'] ?? $in['href'] ?? '';
        if (!$fUrl) out(['error' => 'No file URL provided'], 400);

        $decodedUrl = urldecode($fUrl);
        $searchDir = rtrim($uploadDir, '/');
        $pos = strpos($decodedUrl, $searchDir);
        $relPath = ($pos !== false) ? ltrim(substr($decodedUrl, $pos + strlen($searchDir)), '/') : basename($decodedUrl);

        if ($relPath) {
            $metaPath = DATA_ROOT . $uploadDir . '/metadata.json';
            $meta = read_json($metaPath);
            $currentMeta = $meta[$relPath] ?? $meta[basename($relPath)] ?? [];
            unset($in['id'], $in['fileUrl'], $in['imageUrl'], $in['href']);
            $meta[$relPath] = array_merge($currentMeta, $in, [
                'name' => $in['name'] ?? $in['title'] ?? pathinfo($relPath, PATHINFO_FILENAME),
                'category' => $in['category'] ?? ''
            ]);
            write_json($metaPath, $meta);
            out(['id' => md5($relPath)], 201);
        }
        out(['error' => 'Invalid filename'], 400);
    });

    // UPDATE
    route('PUT', "$modRoute/:id", function($id) use ($uploadDir) {
        auth();
        $in = body();
        $dirPath = DATA_ROOT . $uploadDir;
        $metaPath = $dirPath . '/metadata.json';
        $meta = read_json($metaPath);
        $found = false;

        foreach (scandir($dirPath) as $f) {
            if ($f === '.' || $f === '..' || strtolower($f) === 'metadata.json') continue;
            $filesToCheck = [];
            if (is_dir($dirPath . '/' . $f)) {
                foreach (scandir($dirPath . '/' . $f) as $sf) {
                    if ($sf !== '.' && $sf !== '..') $filesToCheck[$f . '/' . $sf] = $sf;
                }
            } else $filesToCheck[$f] = $f;

            foreach ($filesToCheck as $rel => $base) {
                if (md5($rel) === $id) {
                    $currentMeta = $meta[$rel] ?? $meta[$base] ?? [];
                    unset($in['id'], $in['fileUrl'], $in['imageUrl'], $in['href']);
                    $meta[$rel] = array_merge($currentMeta, $in, [
                        'name' => $in['name'] ?? $in['title'] ?? pathinfo($base, PATHINFO_FILENAME),
                        'category' => $in['category'] ?? ''
                    ]);
                    write_json($metaPath, $meta);
                    $found = true;
                    break 2;
                }
            }
        }
        if ($found) out(['success' => true]);
        out(['error' => 'File not found'], 404);
    });

    // DELETE
    route('DELETE', "$modRoute/:id", function($id) use ($uploadDir) {
        auth();
        $dirPath = DATA_ROOT . $uploadDir;
        $metaPath = $dirPath . '/metadata.json';
        $meta = read_json($metaPath);
        $folders = scandir($dirPath);
        foreach ($folders as $f) {
            if ($f === '.' || $f === '..' || strtolower($f) === 'metadata.json') continue;
            if (is_dir($dirPath . '/' . $f)) {
                foreach (scandir($dirPath . '/' . $f) as $sf) {
                    if ($sf !== '.' && $sf !== '..' && md5($f . '/' . $sf) === $id) {
                        @unlink($dirPath . '/' . $f . '/' . $sf);
                        unset($meta[$f . '/' . $sf], $meta[$sf]);
                        write_json($metaPath, $meta);
                        out(['success' => true]);
                    }
                }
            } else if (md5($f) === $id) {
                @unlink($dirPath . '/' . $f);
                unset($meta[$f]);
                write_json($metaPath, $meta);
                out(['success' => true]);
            }
        }
        out(['success' => true]);
    });
}
