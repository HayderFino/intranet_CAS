<?php
// database.php
// Archivo de configuración para la conexión a PostgreSQL

class Database {
    private static $host = 'localhost';
    private static $port = '5432';
    private static $db_name = 'intranet_cas';
    private static $username = 'postgres';
    private static $password = 'root'; // Contraseña configurada
    private static $conn = null;

    public static function getConnection() {
        if (self::$conn === null) {
            try {
                $dsn = "pgsql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$db_name;
                self::$conn = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                // En caso de error, devolvemos un JSON para no romper el formato de la API
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
                exit;
            }
        }
        return self::$conn;
    }
}
