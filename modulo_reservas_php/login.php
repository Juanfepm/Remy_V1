<?php
include_once 'conexion.php';

header('Content-Type: application/json; charset=utf-8');



const ROL_INSTRUCTOR = 1;
const ROL_APRENDIZ   = 2;

$body = json_decode(file_get_contents('php://input'), true) ?: [];



$correo = $_POST['usuario'] ?? $_POST['correo']   ?? $body['usuario'] ?? $body['correo']   ?? '';
$clave  = $_POST['palabra'] ?? $_POST['password'] ?? $body['palabra'] ?? $body['password'] ?? '';

$correo = strtolower(trim($correo));

if ($correo === '' || $clave === '') {
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Escribe tu correo y tu contraseña."]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare(
    "SELECT id_usuario, nombre, apellido, correo, rol_usuario, contrasena, ficha, estado
     FROM usuarios
     WHERE LOWER(correo) = ?
     LIMIT 1"
);
$stmt->bind_param("s", $correo);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();
$stmt->close();



$credencialesMal = ["ok" => false, "mensaje" => "Correo o contraseña incorrectos."];

if (!$usuario) {
    http_response_code(401);
    echo json_encode($credencialesMal, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$guardada = (string) $usuario['contrasena'];



$claveOk = password_verify($clave, $guardada);

if (!$claveOk) {
    http_response_code(401);
    echo json_encode($credencialesMal, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

if (strtolower((string) $usuario['estado']) !== 'activo') {
    http_response_code(403);
    echo json_encode(["ok" => false, "mensaje" => "Tu usuario está inactivo. Habla con el instructor."], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$rol = (int) $usuario['rol_usuario'];

if ($rol !== ROL_INSTRUCTOR && $rol !== ROL_APRENDIZ) {
    http_response_code(403);
    echo json_encode(["ok" => false, "mensaje" => "Este usuario no tiene acceso al panel."], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

echo json_encode([
    "ok"        => true,
    "idUsuario" => $usuario['id_usuario'],
    "nombre"    => trim($usuario['nombre'] . ' ' . $usuario['apellido']),
    "correo"    => $usuario['correo'],
    "rol"       => $rol,
    "rolNombre" => $rol === ROL_INSTRUCTOR ? "instructor" : "aprendiz",
    "ficha"     => $usuario['ficha'],
    "mensaje"   => "Bienvenido"
], JSON_UNESCAPED_UNICODE);

$conn->close();
