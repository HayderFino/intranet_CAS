<?php
/**
 * MECI Module
 */

$meciBase = 'data/menu header/MECI';
$meciMap = [
    'meci/anticorrupcion' => ['dir' => 'Anticorrupcion', 'subfolders' => true],
    'meci/documentos-varios' => ['dir' => 'Documentos varios', 'subfolders' => false],
    'meci/documentos' => ['dir' => 'Documentos', 'subfolders' => false],
];

foreach ($meciMap as $mRoute => $mCfg) {
    $relPath = $meciBase . '/' . $mCfg['dir'];
    $absPath = DATA_ROOT . $relPath;

    // Subfolders map for Anticorrupcion
    $meciSubMap = ($mRoute === 'meci/anticorrupcion') ? [
        '' => 'Planes y Riesgos',
        'Documentos Anticorrupción' => 'Documentos Base',
        'Fortalecimiento de Valores' => 'Valores y Actores',
        'Actores del Plan Anticorrupción' => 'Actores del Plan'
    ] : [];
    $meciSubRevMap = array_flip($meciSubMap);

    // UPLOAD
    route('POST', "$mRoute/upload", function () use ($mRoute, $relPath, $meciSubRevMap) {
        auth();
        $sub = $_POST['subfolder'] ?? '';
        if (isset($meciSubRevMap[$sub]))
            $sub = $meciSubRevMap[$sub];
        $dest = $sub ? "$relPath/$sub" : $relPath;
        $url = upload_file('file', $dest);
        if ($url)
            out(['fileUrl' => ltrim($url, '/')]);
        out(['message' => 'Error upload'], 400);
    });

    // LIST
    route('GET', $mRoute, function () use ($absPath, $mCfg, $relPath, $meciSubMap) {
        $items = [];
        $foldersToScan = [''];
        if ($mCfg['subfolders'] && is_dir($absPath)) {
            $foldersToScan = array_merge([''], array_filter(scandir($absPath), fn($f) => $f !== '.' && $f !== '..' && is_dir("$absPath/$f")));
        }

        foreach ($foldersToScan as $sub) {
            $scanDir = ($sub !== '') ? "$absPath/$sub" : $absPath;
            if (!is_dir($scanDir))
                continue;

            $meta = read_json("$scanDir/metadata.json");
            $subLabel = $meciSubMap[$sub] ?? $sub;

            foreach (scandir($scanDir) as $f) {
                if ($f === '.' || $f === '..' || is_dir("$scanDir/$f") || $f === 'metadata.json')
                    continue;
                $m = $meta[$f] ?? [];
                $items[] = array_merge($m, [
                    'id' => md5(($sub ? "$sub/" : "") . $f),
                    'filename' => $f,
                    'name' => $m['name'] ?? pathinfo($f, PATHINFO_FILENAME),
                    'href' => $relPath . ($sub !== '' ? "/$sub" : "") . '/' . $f,
                    'subfolder' => $subLabel,
                    'category' => $subLabel
                ]);
            }
        }
        usort($items, fn($a, $b) => strcmp($b['filename'], $a['filename']));
        out($items);
    });

    // CREATE (Metadata)
    route('POST', $mRoute, function () use ($absPath, $meciSubRevMap) {
        auth();
        $in = body();
        $fUrl = $in['fileUrl'] ?? '';
        if (!$fUrl)
            out(['error' => 'No file URL'], 400);
        $f = basename(urldecode($fUrl));
        $sub = $in['subfolder'] ?? '';
        if (isset($meciSubRevMap[$sub]))
            $sub = $meciSubRevMap[$sub];
        $destDir = ($sub !== '') ? "$absPath/$sub" : $absPath;
        $metaPath = "$destDir/metadata.json";
        $meta = read_json($metaPath);
        $meta[$f] = ['name' => $in['name'] ?? pathinfo($f, PATHINFO_FILENAME), 'updatedAt' => date('c')];
        write_json($metaPath, $meta);
        out(['success' => true], 201);
    });

    // DELETE
    route('DELETE', "$mRoute/:id", function ($id) use ($absPath, $mCfg) {
        auth();
        $foldersToScan = [''];
        if ($mCfg['subfolders'] && is_dir($absPath)) {
            $foldersToScan = array_merge([''], array_filter(scandir($absPath), fn($f) => $f !== '.' && $f !== '..' && is_dir("$absPath/$f")));
        }
        foreach ($foldersToScan as $sub) {
            $scanDir = ($sub !== '') ? "$absPath/$sub" : $absPath;
            if (!is_dir($scanDir))
                continue;
            foreach (scandir($scanDir) as $f) {
                if (md5(($sub ? "$sub/" : "") . $f) === $id) {
                    @unlink("$scanDir/$f");
                    $meta = read_json("$scanDir/metadata.json");
                    unset($meta[$f]);
                    write_json("$scanDir/metadata.json", $meta);
                    out(['success' => true]);
                }
            }
        }
        out(['error' => 'Not found'], 404);
    });

    // UPDATE
    route('PUT', "$mRoute/:id", function ($id) use ($absPath, $mCfg) {
        auth();
        $in = body();
        $foldersToScan = [''];
        if ($mCfg['subfolders'] && is_dir($absPath)) {
            $foldersToScan = array_merge([''], array_filter(scandir($absPath), fn($f) => $f !== '.' && $f !== '..' && is_dir("$absPath/$f")));
        }
        foreach ($foldersToScan as $sub) {
            $scanDir = ($sub !== '') ? "$absPath/$sub" : $absPath;
            if (!is_dir($scanDir))
                continue;
            foreach (scandir($scanDir) as $f) {
                if (md5(($sub ? "$sub/" : "") . $f) === $id) {
                    $meta = read_json("$scanDir/metadata.json");
                    $meta[$f] = array_merge($meta[$f] ?? [], [
                        'name' => $in['name'] ?? $meta[$f]['name'] ?? pathinfo($f, PATHINFO_FILENAME),
                        'updatedAt' => date('c')
                    ]);
                    write_json("$scanDir/metadata.json", $meta);
                    out(['success' => true]);
                }
            }
        }
        out(['error' => 'Not found'], 404);
    });
}
