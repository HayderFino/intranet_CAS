<?php
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "<h1>Caché de PHP limpiada correctamente.</h1>";
} else {
    echo "<h1>OPcache no está habilitado, la caché no era el problema.</h1>";
}
