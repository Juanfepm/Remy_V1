<?php
header('Content-Type: application/json');
include 'conexion.php';



$body = json_decode(file_get_contents('php://input'), true) ?: [];

$idEvento = $_REQUEST['id_evento'] ?? $body['idEvento'] ?? null;
$estado   = $_REQUEST['estado']    ?? $body['estado']   ?? null;

if (!$idEvento || !$estado) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    exit;
}

$stmt = $conn->prepare(
    "UPDATE eventos 
     SET estado             = ?,
         fecha_modificacion = NOW()
     WHERE id_evento = ?"
);
$stmt->bind_param("ss", $estado, $idEvento);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "mensaje" => "Evento cancelado"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "No se encontró el evento o ya tenía ese estado"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
