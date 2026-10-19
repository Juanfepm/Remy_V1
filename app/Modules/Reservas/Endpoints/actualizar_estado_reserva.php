<?php
include 'conexion.php';
header('Content-Type: application/json');

$id_reserva = $_POST['id_reserva'] ?? $_GET['id_reserva'] ?? '';
$estado     = $_POST['estado']     ?? $_GET['estado']     ?? '';

if (empty($id_reserva) || empty($estado)) {
    http_response_code(400);
    echo json_encode(["error" => "Parámetros incompletos"]);
    exit();
}

$sql = "UPDATE reservas_dia SET estado = ? WHERE id_reserva = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error al preparar la consulta"]);
    exit();
}

$stmt->bind_param("ss", $estado, $id_reserva);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => "Estado actualizado"]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "No se encontró la reserva o el estado ya era el mismo"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo actualizar"]);
}

$stmt->close();
$conn->close();
?>