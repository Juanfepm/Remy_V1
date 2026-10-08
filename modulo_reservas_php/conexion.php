<?php



require_once __DIR__ . '/cabeceras.php';







date_default_timezone_set('America/Bogota');

$host = getenv('REMY_DB_HOST') ?: "localhost";
$user = getenv('REMY_DB_USER');
$pass = getenv('REMY_DB_PASSWORD');
$db   = getenv('REMY_DB_NAME') ?: "remy";
$port = (int) (getenv('REMY_DB_PORT') ?: 3306);

if ($user === false || $user === '' || $pass === false) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Falta configurar REMY_DB_USER y REMY_DB_PASSWORD"]);
    exit;
}

$conexion = mysqli_connect($host, $user, $pass, $db, $port);

if (!$conexion) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}
mysqli_set_charset($conexion, "utf8mb4");


$conn = $conexion;
