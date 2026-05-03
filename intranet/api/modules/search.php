<?php
/**
 * Global Search Module
 */

route('GET', 'search', function() {
    $q = strtolower(trim($_GET['q'] ?? ''));
    $cat = strtolower(trim($_GET['category'] ?? 'all'));
    $sDate = empty($_GET['startDate']) ? null : strtotime($_GET['startDate']);
    $eDate = empty($_GET['endDate']) ? null : strtotime($_GET['endDate']);

    $results = [];
    $seen = [];
    $docExts = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];

    $isValidDate = function ($dateStr) use ($sDate, $eDate) {
        if (!$sDate && !$eDate) return true;
        if (!$dateStr) return false;
        $ts = strtotime($dateStr);
        if (!$ts) return true;
        if ($sDate && $ts < $sDate) return false;
        if ($eDate && $ts > $eDate + 86400) return false;
        return true;
    };

    $matchText = function ($text) use ($q) {
        if ($q === '') return true;
        return strpos(strtolower($text), $q) !== false;
    };

    // A) Noticias
    if ($cat === 'all' || strpos($cat, 'noticia') !== false) {
        foreach (read_json(DATA_ROOT . 'data/noticias.json') as $n) {
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

    // B) HTML files
    $htmlDirs = ['header_menu/cas', 'header_menu/sgi', 'header_menu/git', 'herramientas'];
    foreach ($htmlDirs as $d) {
        $files = glob(DATA_ROOT . $d . '/*.html') ?: [];
        foreach ($files as $f) {
            $content = file_get_contents($f);
            preg_match_all('/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i', $content, $all, PREG_SET_ORDER);
            foreach ($all as $hit) {
                $href = $hit[1];
                if (!$href || $href === '#' || isset($seen[$href])) continue;
                $ext = strtolower(pathinfo($href, PATHINFO_EXTENSION));
                if (!in_array($ext, $docExts) && !preg_match('/class="[^"]*(?:file-item|pdf-folder-card|btn-pdf-download)[^"]*"/i', $hit[0])) continue;

                $linkText = trim(strip_tags($hit[2]));
                $name = (strlen($linkText) > 3) ? $linkText : basename($href);
                $name = trim(dent($name));

                $fileCat = 'Documento';
                if (strpos($f, 'sgi') !== false) $fileCat = 'SGI';
                if (strpos($f, 'git') !== false) $fileCat = 'GIT';
                if (strpos($f, 'herramientas') !== false) $fileCat = 'Herramienta';

                if (($cat === 'all' || strtolower($fileCat) === $cat || strpos(strtolower($fileCat), $cat) !== false) && ($matchText($name) || $matchText($href))) {
                    if (strpos($href, '../../') === 0) $href = WEB_BASE_PATH . substr($href, 6);
                    else if (strpos($href, 'http') !== 0 && strpos($href, '/') !== 0) $href = WEB_BASE_PATH . $d . '/' . $href;
                    $results[] = ['type' => $fileCat, 'title' => $name, 'href' => $href, 'snippet' => 'Encontrado en ' . basename($f), 'date' => date('Y-m-d', filemtime($f))];
                    $seen[$href] = true;
                }
            }
        }
    }

    // C) Physical files
    $dataDirs = ['data/menu header', 'data/Talento humano', 'data/Herramientas'];
    $scanDocs = function ($dir, $root) use (&$scanDocs, $docExts, $q, $cat, $isValidDate, $matchText, &$results, &$seen) {
        if (!is_dir($dir)) return;
        foreach (scandir($dir) as $f) {
            if ($f === '.' || $f === '..') continue;
            $full = $dir . '/' . $f;
            if (is_dir($full)) { $scanDocs($full, $root); continue; }
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (!in_array($ext, $docExts)) continue;
            $fileCat = strtoupper($ext);
            $modTime = filemtime($full);
            if (($cat === 'all' || strtolower($fileCat) === $cat) && ($matchText($f)) && ($isValidDate(date('Y-m-d', $modTime)))) {
                $rel = WEB_BASE_PATH . ltrim(str_replace('\\', '/', substr($full, strlen($root))), '/');
                if (!isset($seen[$rel])) {
                    $results[] = ['type' => $fileCat, 'title' => pathinfo($f, PATHINFO_FILENAME), 'href' => $rel, 'snippet' => 'Archivo físico en ' . basename(dirname($full)), 'date' => date('Y-m-d', $modTime)];
                    $seen[$rel] = true;
                }
            }
        }
    };
    foreach ($dataDirs as $d) $scanDocs(DATA_ROOT . $d, DATA_ROOT);

    out(array_slice($results, 0, 50));
});
