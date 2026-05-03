<?php
/**
 * Herramientas Module (RUA, PCB)
 */

// --- RUA ---
$ruaJson = DATA_ROOT . 'data/Herramientas/Rua/rua.json';

route('GET', 'rua', function() use ($ruaJson) {
    out(read_json($ruaJson));
});

route('POST', 'rua', function() use ($ruaJson) {
    auth();
    $in = body();
    $data = read_json($ruaJson);
    $in['id'] = uniqid();
    $in['createdAt'] = date('c');
    array_unshift($data, $in);
    write_json($ruaJson, $data);
    out(['id' => $in['id']], 201);
});

route('POST', 'rua/upload', function() {
    auth();
    $url = upload_file('file', 'data/Herramientas/Rua');
    if ($url) out(['fileUrl' => $url]);
    out(['message' => 'Error'], 400);
});

route('DELETE', 'rua/:id', function($id) use ($ruaJson) {
    auth();
    $data = read_json($ruaJson);
    $data = array_values(array_filter($data, fn($i) => ($i['id'] ?? '') !== $id));
    write_json($ruaJson, $data);
    out(['success' => true]);
});

route('PUT', 'rua/:id', function($id) use ($ruaJson) {
    auth();
    $in = body();
    $data = read_json($ruaJson);
    foreach ($data as &$item) {
        if (($item['id'] ?? '') === $id) {
            $item = array_merge($item, $in);
            break;
        }
    }
    write_json($ruaJson, $data);
    out(['success' => true]);
});


// --- PCB ---
$pcbHtml = DATA_ROOT . 'herramientas/pcb.html';
$pcbTabla = DATA_ROOT . 'data/Herramientas/pcb-tabla.json';

$syncPcbTable = function () use ($pcbTabla, $pcbHtml) {
    $data = read_json($pcbTabla);
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
    $content = file_get_contents($pcbHtml);
    $content = preg_replace('/<tbody>[\s\S]*?<!-- END_PCB_TABLE -->/i', "<tbody>" . $htmlRows . "\n\n                <!-- END_PCB_TABLE -->", $content, 1);
    file_put_contents($pcbHtml, $content);
};

route('GET', 'pcb', function() use ($pcbHtml) {
    if (!file_exists($pcbHtml)) out([]);
    $content = file_get_contents($pcbHtml);
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
});

route('POST', 'pcb', function() use ($pcbHtml) {
    auth();
    $in = body();
    $id = 'pcb_' . time();
    $url = $in['fileUrl'] ?? '#';
    $name = eent($in['title'] ?? 'Documento PCB');
    $icon = '<div class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div>';
    $card = "\n<a href=\"$url\" target=\"_blank\" class=\"file-item\" data-id=\"$id\">$icon<div><div class=\"file-name\">$name</div><div class=\"file-meta\">PDF</div></div></a>";
    $content = file_get_contents($pcbHtml);
    $content = preg_replace('/(<div[^>]*class="file-list-grid"[^>]*>)/i', '$1' . $card, $content, 1);
    file_put_contents($pcbHtml, $content);
    out(['id' => $id], 201);
});

route('POST', 'pcb/upload', function() {
    auth();
    $url = upload_file('file', 'data/Herramientas/PCB');
    if ($url) out(['fileUrl' => $url]);
    out(['message' => 'Error'], 400);
});

route('DELETE', 'pcb/:id', function($id) use ($pcbHtml) {
    auth();
    $content = file_get_contents($pcbHtml);
    $idEsc = preg_quote($id, '/');
    $pat = '/<a [^>]*class="(?:file-item|pdf-folder-card)"[^>]*data-id="' . $idEsc . '"[^>]*>[\s\S]*?<\/a>/i';
    if (preg_match($pat, $content, $hit)) {
        if (preg_match('/href="([^"]+)"/i', $hit[0], $hr)) {
            $f = $hr[1];
            if (strpos($f, '../') === 0) $f = substr($f, 3);
            $full = DATA_ROOT . ltrim($f, '/');
            if (file_exists($full) && is_file($full)) @unlink($full);
        }
        $content = preg_replace($pat, '', $content, 1);
        file_put_contents($pcbHtml, $content);
    }
    out(['success' => true]);
});

route('GET', 'pcb/tabla', function() use ($pcbTabla) {
    out(read_json($pcbTabla));
});

route('POST', 'pcb/tabla', function() use ($pcbTabla, $syncPcbTable) {
    auth();
    $in = body();
    $in['id'] = uniqid();
    $data = read_json($pcbTabla);
    $data[] = $in;
    write_json($pcbTabla, $data);
    $syncPcbTable();
    out(['id' => $in['id']], 201);
});

route('DELETE', 'pcb/tabla/:id', function($id) use ($pcbTabla, $syncPcbTable) {
    auth();
    $data = read_json($pcbTabla);
    $data = array_values(array_filter($data, fn($i) => $i['id'] !== $id));
    write_json($pcbTabla, $data);
    $syncPcbTable();
    out(['success' => true]);
});

route('PUT', 'pcb/tabla/:id', function($id) use ($pcbTabla, $syncPcbTable) {
    auth();
    $in = body();
    $data = read_json($pcbTabla);
    foreach ($data as &$r) {
        if ($r['id'] === $id) {
            $r = array_merge($r, $in);
            break;
        }
    }
    write_json($pcbTabla, $data);
    $syncPcbTable();
    out(['success' => true]);
});
