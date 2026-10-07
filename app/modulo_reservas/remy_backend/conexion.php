<?php



require_once __DIR__ . '/cabeceras.php';







date_default_timezone_set('America/Bogota');

$host = "localhost";
$user = "root";
$pass = "";
$db   = "remy";

$conexion = mysqli_connect($host, $user, $pass, $db);

if (!$conexion) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}
mysqli_set_charset($conexion, "utf8mb4");


$conn = $conexion;
