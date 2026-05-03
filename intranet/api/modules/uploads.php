<?php
/**
 * Uploads Module
 */

// /api/news/upload
route('POST', 'news/upload', function() {
    auth();
    $url = upload_file('image', 'data/imagenes');
    if ($url) out(['imageUrl' => $url]);
    out(['message' => 'No se subió imagen'], 400);
});

// /api/banner/upload
route('POST', 'banner/upload', function() {
    auth();
    $url = upload_file('image', 'data/imagenes');
    if ($url) out(['imageUrl' => $url]);
    out(['message' => 'Error'], 400);
});

// /api/sgi/upload
route('POST', 'sgi/upload', function() {
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
    if ($url) out(['fileUrl' => $url]);
    out(['message' => 'Error upload'], 400);
});
