<?php
/**
 * Generic JSON CRUD Module
 */

function register_json_crud($key, $filePath) {
    $fullPath = DATA_ROOT . $filePath;

    // LIST
    route('GET', $key, function() use ($fullPath) {
        out(read_json($fullPath));
    });

    // CREATE
    route('POST', $key, function() use ($key, $fullPath) {
        auth($key);
        $in = body();
        $data = read_json($fullPath);
        
        if ($key === 'users') {
            $in['password'] = password_hash($in['password'] ?? '', PASSWORD_BCRYPT);
        }
        
        $in['id'] = uniqid();
        $in['createdAt'] = date('c');
        array_unshift($data, $in);
        write_json($fullPath, $data);
        out(['message' => 'Creado', 'id' => $in['id']], 201);
    });

    // DELETE
    route('DELETE', "$key/:id", function($id) use ($key, $fullPath) {
        auth($key);
        $data = read_json($fullPath);
        $data = array_values(array_filter(
            $data,
            function ($i) use ($id) {
                $iid = $i['id'] ?? $i['_id']['$oid'] ?? $i['_id'] ?? '';
                return $iid !== $id;
            }
        ));
        write_json($fullPath, $data);
        out(['message' => 'Eliminado']);
    });

    // UPDATE
    route('PUT', "$key/:id", function($id) use ($key, $fullPath) {
        auth($key);
        $in = body();
        $data = read_json($fullPath);
        $found = false;
        foreach ($data as &$item) {
            $iid = $item['id'] ?? $item['_id']['$oid'] ?? $item['_id'] ?? '';
            if ($iid === $id) {
                if ($key === 'users' && !empty($in['password'])) {
                    $in['password'] = password_hash($in['password'], PASSWORD_BCRYPT);
                }
                $item = array_merge($item, $in);
                $found = true;
                break;
            }
        }
        if ($found) {
            write_json($fullPath, $data);
            out(['message' => 'Actualizado']);
        }
        out(['error' => 'Not found'], 404);
    });
}

// Register standard CRUDs
$JSON_MAP = [
    'news' => 'data/noticias.json',
    'eventos' => 'data/eventos.json',
    'banner' => 'data/banner.json',
    'directorio' => 'data/directorio.json',
    'users' => 'default_user.json',
    'agenda' => 'data/agenda.json',
];

foreach ($JSON_MAP as $key => $file) {
    register_json_crud($key, $file);
}
