<?php
/**
 * ============================================================
 *  API UNIVERSAL - INTRANET CAS (Modular Version)
 *  ============================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$route = trim($_GET['route'] ?? '', '/');
$method = $_SERVER['REQUEST_METHOD'];

// Configuration & Constants
$baseDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
define('WEB_BASE_PATH', $baseDir . '/');
define('DATA_ROOT', __DIR__ . '/');

// Load Core
require_once 'api/core/helpers.php';
require_once 'api/core/auth.php';
require_once 'api/core/router.php';

// Load Modules
require_once 'api/modules/auth.php';
require_once 'api/modules/jsonCrud.php';
require_once 'api/modules/uploads.php';
require_once 'api/modules/sgi.php';
require_once 'api/modules/respel.php';
require_once 'api/modules/meci.php';
require_once 'api/modules/herramientas.php';
require_once 'api/modules/search.php';
require_once 'api/modules/misc.php';

// Dispatch Request
dispatch($method, $route);
