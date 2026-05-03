<?php
/**
 * RESPEL Module
 */

$RESPEL_SECTIONS = ['documentos', 'obligaciones', 'gestores', 'empresas'];

// Upload
route('POST', 'respel/upload', function() {
    auth();
    $sec = $_POST['section'] ?? 'documentos';
    $url = upload_file('file', 'data/Herramientas/RESPEL/' . $sec);
    if ($url) out(['fileUrl' => $url]);
    out(['message' => 'Error upload'], 400);
});

foreach ($RESPEL_SECTIONS as $sec) {
    $path = DATA_ROOT . 'data/Herramientas/RESPEL/' . $sec . '.json';

    // GET
    route('GET', "respel/$sec", function() use ($path) {
        out(read_json($path));
    });

    // POST
    route('POST', "respel/$sec", function() use ($path) {
        auth();
        $in = body();
        $data = read_json($path);
        $in['id'] = uniqid();
        $in['createdAt'] = date('c');
        array_unshift($data, $in);
        write_json($path, $data);
        out(['message' => 'Creado', 'id' => $in['id']], 201);
    });

    // DELETE
    route('DELETE', "respel/$sec/:id", function($id) use ($path) {
        auth();
        $data = read_json($path);
        foreach ($data as $item) {
            if (($item['id'] ?? '') === $id && !empty($item['fileUrl'])) {
                $abs = DATA_ROOT . ltrim($item['fileUrl'], '/');
                if (file_exists($abs)) @unlink($abs);
            }
        }
        $data = array_values(array_filter($data, fn($i) => ($i['id'] ?? '') !== $id));
        write_json($path, $data);
        out(['success' => true]);
    });

    // PUT
    route('PUT', "respel/$sec/:id", function($id) use ($path) {
        auth();
        $in = body();
        $data = read_json($path);
        foreach ($data as &$item) {
            if (($item['id'] ?? '') === $id) {
                $item = array_merge($item, $in);
                break;
            }
        }
        write_json($path, $data);
        out(['success' => true]);
    });
}
