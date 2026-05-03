<?php
/**
 * Core Helpers for Intranet CAS API
 */

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

/** Decode HTML entities → real chars */
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

/** Encode real chars → HTML entities */
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

/** Read JSON file safely */
function read_json($path)
{
    if (!file_exists($path))
        return [];
    return json_decode(file_get_contents($path), true) ?? [];
}

/** Write JSON file safely */
function write_json($path, $data)
{
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

/** Upload a file from $_FILES[$field] to $destDir, return relative URL */
function upload_file($field, $destDir)
{
    if (!isset($_FILES[$field]))
        return null;
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK)
        return null;

    $dir = DATA_ROOT . ltrim($destDir, '/');
    if (!is_dir($dir))
        mkdir($dir, 0777, true);

    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    $cleanName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($f['name'], PATHINFO_FILENAME));
    $name = time() . '-' . $cleanName . '.' . $ext;

    if (move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) {
        return ltrim($destDir, '/') . '/' . $name;
    }
    return null;
}

/** Strip a block with data-id from an HTML file */
function html_remove_block($htmlPath, $id, $pattern)
{
    if (!file_exists($htmlPath)) return false;
    $content = file_get_contents($htmlPath);
    $escaped = preg_quote($id, '/');
    $regex = str_replace('__ID__', $escaped, $pattern);
    $match = [];
    if (preg_match($regex, $content, $match)) {
        // Try to delete physical file referenced in href/src
        if (preg_match('/(?:href|src)="([^"]+)"/i', $match[0], $fh)) {
            $rel = $fh[1];
            if ($rel && $rel !== '#' && strpos($rel, 'http') === false) {
                $abs = realpath(DATA_ROOT . ltrim(str_replace('../../', '', $rel), '/'));
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

/** Get items with data-id="…" from an HTML file using a regex */
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
